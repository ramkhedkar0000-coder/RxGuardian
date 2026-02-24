export interface Order {
    "Patient ID": string;
    "Patient Age": number;
    "Patient Gender": string;
    "Purchase Date": number;
    "Product Name": string;
    "Quantity": number;
    "Total Price (EUR)": number;
    "Dosage Frequency": string;
    "Prescription Required": string;
}

export interface RefillAlert {
    patientId: string;
    productName: string;
    purchaseDate: Date;
    quantity: number;
    dosageFrequency: string;
    dailyUsage: number;
    daysSupply: number;
    expectedRefillDate: Date;
    daysUntilRefill: number;
    status: 'CRITICAL' | 'WARNING' | 'OK';
}

export interface Product {
    "product id": string;
    "product name": string;
    "Main Ingredient": string;
    "Dosage": string;
    "Unit Type": string;
    "Price": number;
    "Stock": number; // Added for stock management
}
