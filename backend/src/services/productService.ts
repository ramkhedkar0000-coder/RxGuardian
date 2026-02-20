import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// ─── Excel source (single source of truth = backend/) ────────────────────────
// Primary:  backend/products-export.xlsx
// Fallback: root-level copy (backward compat only — safe to delete)
const EXCEL_PRIMARY = path.join(__dirname, '../../products-export.xlsx');
const EXCEL_FALLBACK = path.join(__dirname, '../../../products-export.xlsx');

// ─── In-memory cache ──────────────────────────────────────────────────────────
const CACHE_TTL_MS = 30_000; // re-read Excel every 30 seconds
let cache: Product[] = [];
let cacheTimestamp = 0;

export interface Product {
    id: string;
    name: string;
    pzn: string;
    price: number;
    packageSize: string;
    description: string;
    stock: number;
}

// ─── Normalise a raw Excel row → Product ─────────────────────────────────────
const toProduct = (row: any, index: number): Product => {
    const id = String(row['product id'] ?? row['Product ID'] ?? row['id'] ?? index + 1);
    const price = parseFloat(
        String(row['price rec'] ?? row['Price'] ?? row['price'] ?? '0').replace(',', '.')
    ) || 0;

    // Assign stable mock stock based on product id (deterministic, not random)
    const numericId = parseInt(id.replace(/\D/g, '') || '0', 10);
    const stock = typeof row['Stock'] === 'number'
        ? row['Stock']
        : (numericId * 7) % 150 + 10; // always at least 10

    return {
        id,
        name: String(row['product name'] ?? row['Product Name'] ?? row['name'] ?? ''),
        pzn: String(row['pzn'] ?? row['PZN'] ?? ''),
        price,
        packageSize: String(row['package size'] ?? row['Package Size'] ?? ''),
        description: String(row['descriptions'] ?? row['Description'] ?? ''),
        stock,
    };
};

// ─── Read directly from Excel (with TTL cache) ────────────────────────────────
export const loadProducts = (): Product[] => {
    const now = Date.now();
    if (cache.length > 0 && now - cacheTimestamp < CACHE_TTL_MS) {
        return cache;
    }

    const filePath = fs.existsSync(EXCEL_PRIMARY) ? EXCEL_PRIMARY : EXCEL_FALLBACK;

    if (!fs.existsSync(filePath)) {
        console.error(`[ProductService] ⚠️  Excel file not found at:\n  ${EXCEL_PRIMARY}\n  ${EXCEL_FALLBACK}`);
        return cache; // return stale cache if file missing
    }

    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const raw: any[] = XLSX.utils.sheet_to_json(sheet);

        cache = raw
            .filter(row => row['product name'] || row['Product Name'] || row['name'])
            .map((row, i) => toProduct(row, i));

        cacheTimestamp = now;
        console.log(`[ProductService] ✅ Loaded ${cache.length} products from Excel (${path.basename(filePath)})`);
    } catch (err) {
        console.error('[ProductService] Failed to read Excel:', err);
    }

    return cache;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const getProductByName = (name: string): Product | undefined => {
    const products = loadProducts();
    return products.find(p => p.name.toLowerCase() === name.toLowerCase());
};

export const checkStock = (name: string, quantity: number): boolean => {
    const p = getProductByName(name);
    return !!p && p.stock >= quantity;
};

export const decrementStock = (name: string, quantity: number): boolean => {
    const products = loadProducts();
    const p = products.find(pr => pr.name.toLowerCase() === name.toLowerCase());
    if (!p || p.stock < quantity) return false;
    p.stock -= quantity;
    console.log(`[ProductService] Stock updated: ${name} → ${p.stock} remaining`);
    return true;
};
