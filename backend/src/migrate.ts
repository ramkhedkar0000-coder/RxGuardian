import * as fs from 'fs';
import * as path from 'path';
import sql from './db';

// Excel serial date → JS Date
const excelSerialToDate = (serial: number): Date =>
    new Date((serial - 25569) * 86400 * 1000);

async function migrate() {
    console.log('[Migrate] Starting migration...');

    // ─── Migrate Products ──────────────────────────────────────────────
    const csvPath = path.join(process.cwd(), '../products.csv');
    if (fs.existsSync(csvPath)) {
        console.log('[Migrate] Processing products.csv');
        const fileContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
        const dataLines = lines.slice(1);

        const products = dataLines.map((line, i) => {
            const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
            const id = cols[0] || String(i + 1);
            const price = parseFloat(cols[7] || '0') || 0;
            const form = cols[4] || '';
            const strength = cols[5] || '';
            const desc = `${form} ${strength}. ${cols[10] ? `Note: ${cols[10]?.replace(/"/g, '')}` : ''}`.trim();
            const pzn = `PZN-${id.padStart(5, '0')}`;
            const stock = parseInt(cols[8] || '0', 10) || 0;
            const packageSize = cols[4] || 'Standard';
            const name = cols[1] || 'Unknown';

            return {
                id,
                name,
                pzn,
                price,
                package_size: packageSize,
                description: desc,
                stock
            };
        }).filter(p => p.name !== 'Unknown');

        console.log(`[Migrate] Found ${products.length} products. Inserting...`);
        try {
            await sql`
                INSERT INTO products ${sql(products, 'id', 'name', 'pzn', 'price', 'package_size', 'description', 'stock')}
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    pzn = EXCLUDED.pzn,
                    price = EXCLUDED.price,
                    package_size = EXCLUDED.package_size,
                    description = EXCLUDED.description,
                    stock = EXCLUDED.stock
            `;
            console.log('[Migrate] Products migration done.');
        } catch (err: any) {
            console.error(`Error inserting products:`, err.message);
        }
    } else {
        console.warn(`[Migrate] Could not find ${csvPath}`);
    }

    // ─── Migrate Orders ──────────────────────────────────────────────
    const jsonPath = path.join(process.cwd(), 'data/orders.json');
    if (fs.existsSync(jsonPath)) {
        console.log('[Migrate] Processing orders.json');
        const rawOrders = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        const orderRecords = rawOrders.map((order: any) => {
            const purchaseDateStr = typeof order['Purchase Date'] === 'number'
                ? excelSerialToDate(order['Purchase Date']).toISOString()
                : new Date().toISOString();

            return {
                patient_id: order['Patient ID'] || 'UNKNOWN',
                medication: order['Product Name'] || 'Unknown Product',
                dosage_frequency: order['Dosage Frequency'] || null,
                last_date: purchaseDateStr,
                status: 'completed'
            };
        });

        console.log(`[Migrate] Found ${orderRecords.length} orders. Inserting...`);
        try {
            await sql`
                INSERT INTO orders ${sql(orderRecords, 'patient_id', 'medication', 'dosage_frequency', 'last_date', 'status')}
            `;
            console.log('[Migrate] Orders migration done.');
        } catch (err: any) {
            console.error(`Error inserting orders:`, err.message);
        }
    } else {
        console.warn(`[Migrate] Could not find ${jsonPath}`);
    }

    console.log('[Migrate] All Done!');
    await sql.end();
    process.exit(0);
}

migrate();
