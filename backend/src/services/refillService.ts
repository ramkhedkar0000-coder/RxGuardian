import { Order } from '../types';
import { RefillAlert } from '../types';

const parseDosage = (frequency: string): number => {
    const freq = frequency.toLowerCase();
    if (freq.includes('once') || freq.includes('1x') || freq.includes('daily')) return 1;
    if (freq.includes('twice') || freq.includes('2x')) return 2;
    if (freq.includes('thrice') || freq.includes('three') || freq.includes('3x')) return 3;
    if (freq.includes('4 hours')) return 6;
    if (freq.includes('6 hours')) return 4;
    if (freq.includes('8 hours')) return 3;
    if (freq.includes('12 hours')) return 2;
    if (freq.includes('weekly')) return 1 / 7;
    return 1; // Default fallback
};

export const calculateRefillAlerts = (orders: any[]): RefillAlert[] => {
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
                lastDate: purchaseDate,
                quantity: order['Quantity'] || 1,
                dosageFrequency: order['Dosage Frequency'] || 'Once daily',
            });
        }
    }

    const alerts = Array.from(groupedMap.values()).map(entry => {
        const lastDate = entry.lastDate;
        const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        const dailyUsage = parseDosage(entry.dosageFrequency);
        const daysSupply = Math.round(entry.quantity / dailyUsage);

        const expectedRefillDate = new Date(lastDate);
        expectedRefillDate.setDate(expectedRefillDate.getDate() + daysSupply);

        const daysUntilRefill = daysSupply - daysSince;

        let status: 'CRITICAL' | 'WARNING' | 'OK' = 'OK';
        if (daysUntilRefill <= 3) status = 'CRITICAL';
        else if (daysUntilRefill <= 7) status = 'WARNING';

        return {
            patientId: entry.patient_id,
            productName: entry.medication,
            purchaseDate: lastDate,
            quantity: entry.quantity,
            dosageFrequency: entry.dosageFrequency,
            dailyUsage,
            daysSupply,
            expectedRefillDate,
            daysUntilRefill,
            status
        };
    });

    // Sort: most days since (most urgent) first
    return alerts.sort((a, b) => a.daysUntilRefill - b.daysUntilRefill);
};
