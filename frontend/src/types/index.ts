export interface Product {
    id: string;
    name: string;
    pzn?: string;
    price: number;
    packageSize?: string;
    description?: string;
    stock: number;
}
