export interface Product {
    "product id": string; // Changed to string to match backend usage
    "product name": string;
    "Main Ingredient": string;
    "Dosage": string;
    "Unit Type": string;
    "Price": number;
    "Stock"?: number; // Optional as it comes from API enrichment
}
