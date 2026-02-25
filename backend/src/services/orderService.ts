import sql from '../db';
import { FunctionDeclaration, SchemaType } from '@google/generative-ai';

// ─── Direct DB Access: Orders ────────────────────────────────────────────────
export const getOrders = async () => {
    try {
        const rows = await sql`
            SELECT id, patient_id as "Patient ID", medication as "Product Name", 
                   dosage_frequency as "Dosage Frequency", last_date as "Purchase Date", status 
            FROM orders
            ORDER BY last_date DESC
        `;
        return rows;
    } catch (err) {
        console.error('[OrderService] Failed to read from DB:', err);
        return [];
    }
};

// Add a new in-session order
export const addOrder = async (order: any): Promise<any> => {
    try {
        const row = await sql`
            INSERT INTO orders (patient_id, medication, dosage_frequency, last_date, status)
            VALUES (
                ${order['Patient ID'] || 'GUEST-001'},
                ${order['Product Name']},
                'Once daily',
                ${order['_purchaseDateISO']},
                'Confirmed'
            )
            RETURNING *
        `;
        console.log('[OrderService] New order saved in DB:', row[0].medication);
        return order;
    } catch (err) {
        console.error('[OrderService] Failed to insert order:', err);
        return order; // fallback to returning the obj even if db fails
    }
};

// ─── Gemini Function Declaration ──────────────────────────────────────────────
export const placeOrderTool: FunctionDeclaration = {
    name: 'placeOrder',
    description:
        'Places a new medication order. Call this ONLY when the user explicitly says they want to order or buy a specific medication.',
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            productName: {
                type: SchemaType.STRING,
                description: 'Exact product name as listed in the catalog',
            },
            quantity: {
                type: SchemaType.INTEGER,
                description: 'Number of packs/units to order',
            },
            patientId: {
                type: SchemaType.STRING,
                description: "Patient ID string (e.g. 'PAT001'). Use 'GUEST-001' if unknown.",
            },
        },
        required: ['productName', 'quantity'],
    },
};
