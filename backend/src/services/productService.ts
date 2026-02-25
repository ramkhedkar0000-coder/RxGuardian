import sql from '../db';

export interface Product {
    id: string;
    name: string;
    pzn: string;
    price: number;
    packageSize: string;
    description: string;
    stock: number;
}

// ─── Read directly from Postgres ────────────────────────────────
export const loadProducts = async (): Promise<Product[]> => {
    try {
        const rows = await sql`
            SELECT id, name, pzn, price, package_size as "packageSize", description, stock
            FROM products
            ORDER BY name ASC
        `;
        return rows as unknown as Product[];
    } catch (err) {
        console.error('[ProductService] Failed to read from DB:', err);
        return [];
    }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const getProductByName = async (name: string): Promise<Product | undefined> => {
    try {
        const rows = await sql`
            SELECT id, name, pzn, price, package_size as "packageSize", description, stock
            FROM products
            WHERE name ILIKE ${name}
            LIMIT 1
        `;
        return rows[0] as Product | undefined;
    } catch (err) {
        console.error(`[ProductService] Failed to get product: ${name}`, err);
        return undefined;
    }
};

export const checkStock = async (name: string, quantity: number): Promise<boolean> => {
    const p = await getProductByName(name);
    return !!p && p.stock >= quantity;
};

export const decrementStock = async (name: string, quantity: number): Promise<boolean> => {
    try {
        const rows = await sql`
            UPDATE products
            SET stock = stock - ${quantity}
            WHERE name ILIKE ${name} AND stock >= ${quantity}
            RETURNING stock
        `;
        if (rows.length === 0) return false;

        console.log(`[ProductService] Stock updated: ${name} → ${rows[0].stock} remaining`);
        return true;
    } catch (err) {
        console.error(`[ProductService] Failed to decrement stock for: ${name}`, err);
        return false;
    }
};
