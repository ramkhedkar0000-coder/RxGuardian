import { Header } from "@/components/Header";

interface Order {
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

async function getOrders(): Promise<Order[]> {
    try {
        const res = await fetch('http://localhost:3001/api/orders', {
            cache: 'no-store',
            next: { revalidate: 0 }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch orders');
        }

        return res.json();
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
}

function formatDate(excelSerial: number): string {
    // Excel base date: Dec 30, 1899
    const date = new Date((excelSerial - 25569) * 86400 * 1000);
    return date.toLocaleDateString();
}

export default async function OrdersPage() {
    const orders = await getOrders();

    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50">
            <Header />

            <main className="flex-grow pt-24 pb-12 px-6">
                <div className="container mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800">Order History</h1>
                        <p className="text-slate-500 mt-2">View past orders and patient purchase data.</p>
                    </div>

                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200/60 bg-slate-50/50">
                                        <th className="p-4 font-semibold text-slate-600">Patient ID</th>
                                        <th className="p-4 font-semibold text-slate-600">Product</th>
                                        <th className="p-4 font-semibold text-slate-600">Date</th>
                                        <th className="p-4 font-semibold text-slate-600">Qty</th>
                                        <th className="p-4 font-semibold text-slate-600">Total Price</th>
                                        <th className="p-4 font-semibold text-slate-600">Prescription</th>
                                        <th className="p-4 font-semibold text-slate-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-slate-500">
                                                No orders found.
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order, index) => (
                                            <tr key={index} className="border-b border-slate-100 hover:bg-white/40 transition-colors">
                                                <td className="p-4 font-medium text-slate-700">{order["Patient ID"]}</td>
                                                <td className="p-4 text-slate-800 font-medium max-w-xs truncate" title={order["Product Name"]}>
                                                    {order["Product Name"]}
                                                </td>
                                                <td className="p-4 text-slate-600">{formatDate(order["Purchase Date"])}</td>
                                                <td className="p-4 text-slate-600">{order["Quantity"]}</td>
                                                <td className="p-4 font-medium text-slate-800">€{order["Total Price (EUR)"].toFixed(2)}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order["Prescription Required"] === "Yes"
                                                            ? "bg-amber-100 text-amber-700"
                                                            : "bg-green-100 text-green-700"
                                                        }`}>
                                                        {order["Prescription Required"]}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                        Completed
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
