import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── Services ─────────────────────────────────────────────────────────────────
import { loadProducts } from './services/productService';
import { getOrders, addOrder } from './services/orderService';
import { processUserQuery, getSmartLogs } from './services/chatService';
import { sendRefillReminder, getNotificationLogs } from './services/notificationService';

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        service: 'RXGuardians Backend',
        version: '2.0.0',
        endpoints: [
            'GET  /api/products',
            'GET  /api/orders',
            'POST /api/orders',
            'GET  /api/refill-alerts',
            'POST /api/chat',
            'GET  /api/logs',
            'POST /api/notify-refill',
            'GET  /api/notifications',
        ],
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTS  — reads live from Excel (30s TTL cache)
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/products', async (_req: Request, res: Response) => {
    try {
        const products = await loadProducts();
        // Return the normalised Product shape the frontend expects
        res.json(products);
    } catch (err) {
        console.error('[/api/products]', err);
        res.status(500).json({ error: 'Failed to load products' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS  — reads live from Excel (30s TTL cache)
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/orders', async (_req: Request, res: Response) => {
    try {
        res.json(await getOrders());
    } catch (err) {
        res.status(500).json({ error: 'Failed to load orders' });
    }
});

// POST /api/orders — create a new order (from frontend Add to Cart)
app.post('/api/orders', async (req: Request, res: Response) => {
    try {
        const { productName, quantity, patientId, price } = req.body;
        if (!productName || !quantity) {
            res.status(400).json({ error: 'productName and quantity are required' });
            return;
        }

        const order = {
            id: `ORD-${Date.now()}`,
            'Patient ID': patientId || 'GUEST-001',
            'Product Name': productName,
            'Quantity': quantity,
            'Total Price (EUR)': price || 0,
            'Purchase Date': new Date().toISOString(),
            '_purchaseDateISO': new Date().toISOString(),
            status: 'Processing',
            'Dosage Frequency': 'Once daily',
            'Prescription Required': 'No',
        };

        await addOrder(order);
        res.status(201).json({ success: true, order });
    } catch (err) {
        console.error('[POST /api/orders]', err);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// REFILL ALERTS  — computed from live orders
// Shape returned: { patient_id, medication, last_order_date, days_since_last_order, recommendation }
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/refill-alerts', async (_req: Request, res: Response) => {
    try {
        const orders = await getOrders();
        const today = new Date();

        // Group orders by patient+product, get most recent purchase per pair
        const groupedMap = new Map<string, any>();
        for (const order of orders) {
            const patientId = order['Patient ID'] || 'UNKNOWN';
            const product = order['Product Name'] || '';
            const key = `${patientId}::${product}`;

            // Parse purchase date
            let purchaseDate: Date;
            if (order._purchaseDateISO) {
                purchaseDate = new Date(order._purchaseDateISO);
            } else if (typeof order['Purchase Date'] === 'number') {
                purchaseDate = new Date((order['Purchase Date'] - 25569) * 86400 * 1000);
            } else {
                purchaseDate = new Date(order['Purchase Date']);
            }

            const existing = groupedMap.get(key);
            if (!existing || purchaseDate > new Date(existing.lastDate)) {
                groupedMap.set(key, {
                    patient_id: patientId,
                    medication: product,
                    lastDate: purchaseDate.toISOString(),
                    quantity: order['Quantity'] || 1,
                    dosageFrequency: order['Dosage Frequency'] || 'Once daily',
                });
            }
        }

        const alerts = Array.from(groupedMap.values()).map(entry => {
            const lastDate = new Date(entry.lastDate);
            const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

            // Estimate days supply from quantity & dosage
            const freq = (entry.dosageFrequency || '').toLowerCase();
            let dailyUsage = 1;
            if (freq.includes('twice') || freq.includes('2x')) dailyUsage = 2;
            else if (freq.includes('thrice') || freq.includes('three') || freq.includes('3x')) dailyUsage = 3;
            else if (freq.includes('4 hours')) dailyUsage = 6;
            else if (freq.includes('6 hours')) dailyUsage = 4;
            else if (freq.includes('8 hours')) dailyUsage = 3;
            else if (freq.includes('weekly')) dailyUsage = 1 / 7;

            const daysSupply = Math.round(entry.quantity / dailyUsage);

            let recommendation = 'Continue monitoring';
            if (daysSince > daysSupply) recommendation = 'Overdue — contact patient immediately';
            else if (daysSince > daysSupply - 5) recommendation = 'Refill due soon — send reminder';
            else if (daysSince > 25) recommendation = 'Check with patient on adherence';

            return {
                patient_id: entry.patient_id,
                medication: entry.medication,
                last_order_date: entry.lastDate,
                days_since_last_order: daysSince,
                days_supply: daysSupply,
                dosage_frequency: entry.dosageFrequency,
                recommendation,
            };
        });

        // Sort: most days since (most urgent) first
        alerts.sort((a, b) => b.days_since_last_order - a.days_since_last_order);

        res.json(alerts);
    } catch (err) {
        console.error('[/api/refill-alerts]', err);
        res.status(500).json({ error: 'Failed to calculate refill alerts' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT  — Gemini AI with function calling
// Frontend sends: { message, patientId }
// Frontend expects: { response }   ← was incorrectly { message } before
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/chat', async (req: Request, res: Response) => {
    try {
        const { message, patientId } = req.body;
        if (!message) {
            res.status(400).json({ error: 'message is required' });
            return;
        }

        const products = await loadProducts();
        const orders = await getOrders();

        const responseText = await processUserQuery(
            message,
            { products, orders, patientId: patientId || 'GUEST-001' }
        );

        // ✅ Use "response" key — matches chat/page.tsx expectation
        res.json({ response: responseText });
    } catch (err) {
        console.error('[POST /api/chat]', err);
        res.status(500).json({ error: 'Chat service error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOGS
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/logs', (_req: Request, res: Response) => {
    res.json(getSmartLogs());
});

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/notify-refill', async (req: Request, res: Response) => {
    try {
        const { alert, channel } = req.body;
        if (!alert) {
            res.status(400).json({ error: 'alert data is required' });
            return;
        }
        const log = await sendRefillReminder(alert, channel || 'EMAIL');
        res.json({ success: true, log });
    } catch (err) {
        console.error('[POST /api/notify-refill]', err);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

app.get('/api/notifications', (_req: Request, res: Response) => {
    res.json(getNotificationLogs());
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n[Server] RXGuardians Backend running on http://localhost:${PORT}`);
    console.log(`[Data] Source: Live Supabase Postgres DB`);
    console.log(`[AI] Gemini: ${process.env.GEMINI_API_KEY ? 'configured' : 'API_KEY not set'}\n`);
});
