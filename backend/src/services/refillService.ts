import { Order } from '../types';

interface RefillAlert {
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

const parseDosage = (frequency: string): number => {
    const freq = frequency.toLowerCase();
    if (freq.includes('once') || freq.includes('1x') || freq.includes('daily')) return 1;
    if (freq.includes('twice') || freq.includes('2x')) return 2;
    if (freq.includes('thrice') || freq.includes('3x')) return 3;
    if (freq.includes('4 hours')) return 6;
    if (freq.includes('6 hours')) return 4;
    if (freq.includes('8 hours')) return 3;
    if (freq.includes('12 hours')) return 2;
    if (freq.includes('weekly')) return 1 / 7;
    return 1; // Default fallback
};

const excelDateToJSDate = (serial: number): Date => {
    return new Date((serial - 25569) * 86400 * 1000);
};

export const calculateRefillAlerts = (orders: any[]): RefillAlert[] => {
    const today = new Date();

    return orders.map(order => {
        const purchaseDateSerial = order["Purchase Date"];
        const purchaseDate = excelDateToJSDate(purchaseDateSerial);
        const quantity = order["Quantity"];
        const dosageFreq = order["Dosage Frequency"] || "Once daily";

        const dailyUsage = parseDosage(dosageFreq);
        const daysSupply = quantity / dailyUsage;

        const expectedRefillDate = new Date(purchaseDate);
        expectedRefillDate.setDate(expectedRefillDate.getDate() + daysSupply);

        const diffTime = expectedRefillDate.getTime() - today.getTime();
        const daysUntilRefill = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let status: 'CRITICAL' | 'WARNING' | 'OK' = 'OK';
        if (daysUntilRefill <= 3) status = 'CRITICAL';
        else if (daysUntilRefill <= 7) status = 'WARNING';

        return {
            patientId: order["Patient ID"],
            productName: order["Product Name"],
            purchaseDate,
            quantity,
            dosageFrequency: dosageFreq,
            dailyUsage,
            daysSupply,
            expectedRefillDate,
            daysUntilRefill,
            status
        };
    }).sort((a, b) => a.daysUntilRefill - b.daysUntilRefill);
};
