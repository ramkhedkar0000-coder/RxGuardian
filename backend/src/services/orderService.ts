import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { FunctionDeclaration, SchemaType } from '@google/generative-ai';

// ─── Excel source (single source of truth = backend/) ─────────────────────────
// Primary:  backend/Consumer Order History 1.xlsx
// Fallback: root-level copy (in case user keeps it at project root)
const EXCEL_PRIMARY = path.join(__dirname, '../../Consumer Order History 1.xlsx');
const EXCEL_FALLBACK = path.join(__dirname, '../../../Consumer Order History 1.xlsx');

const CACHE_TTL_MS = 30_000; // 30-second cache — changes reflected quickly
let cache: any[] = [];
let cacheTimestamp = 0;

// Excel serial date (days since 1900-01-01) → JS Date
const excelSerialToISO = (serial: number): string =>
    new Date((serial - 25569) * 86400 * 1000).toISOString();

// ─── Read directly from Excel (with TTL cache) ────────────────────────────────
export const loadOrders = (): any[] => {
    const now = Date.now();
    if (cache.length > 0 && now - cacheTimestamp < CACHE_TTL_MS) {
        return cache;
    }

    // Prefer backend/ copy; fall back to root copy
    const filePath = fs.existsSync(EXCEL_PRIMARY)
        ? EXCEL_PRIMARY
        : EXCEL_FALLBACK;

    if (!fs.existsSync(filePath)) {
        console.error(
            `[OrderService] ⚠️  Excel file not found:\n  ${EXCEL_PRIMARY}\n  ${EXCEL_FALLBACK}`
        );
        // Last resort: orders.json (legacy fallback)
        const jsonPath = path.join(__dirname, '../../data/orders.json');
        if (fs.existsSync(jsonPath)) {
            cache = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
            cacheTimestamp = now;
            console.log(`[OrderService] Using legacy orders.json (${cache.length} rows)`);
        }
        return cache;
    }

    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // "Consumer Order History 1.xlsx" has headers on row 5 (range index 4)
        const raw: any[] = XLSX.utils.sheet_to_json(sheet, { range: 4 });

        cache = raw
            .filter(row => row['Product Name'] || row['product name'])
            .map(row => ({
                ...row,
                // Normalise date to ISO string for all consumers
                _purchaseDateISO: typeof row['Purchase Date'] === 'number'
                    ? excelSerialToISO(row['Purchase Date'])
                    : row['Purchase Date'],
            }));

        cacheTimestamp = now;
        console.log(
            `[OrderService] ✅ Loaded ${cache.length} orders from ${path.basename(filePath)}`
        );
    } catch (err) {
        console.error('[OrderService] Failed to read Excel:', err);
    }

    return cache;
};

export const getOrders = (): any[] => loadOrders();

// Add a new in-session order (from POST /api/orders or chat tool)
export const addOrder = async (order: any): Promise<any> => {
    cache.push(order);
    console.log('[OrderService] New order added to session cache:', order.id || order['Product Name']);
    return order;
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
