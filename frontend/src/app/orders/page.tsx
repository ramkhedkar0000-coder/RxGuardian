import { Header } from "@/components/Header";
import { supabase } from "@/lib/supabase";

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
        const { data, error } = await supabase
            .from('orders')
            .select('*');

        if (error) {
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error("Error fetching orders from Supabase:", error);
        return [];
    }
}

function formatDate(excelSerial: number): string {
    const date = new Date((excelSerial - 25569) * 86400 * 1000);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function OrdersPage() {
    const orders = await getOrders();

    return (
        <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20">
            <Header />

            <main className="flex-grow pt-32 pb-20 px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <div className="inline-flex items-center space-x-2 bg-muted px-3 py-1 rounded-full mb-4">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Log Archives</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground">Order History</h1>
                        <p className="text-muted-foreground mt-2 max-w-2xl font-medium">
                            Comprehensive record of all medical transactions and patient prescriptions processed by RxGuardian.
                        </p>
                    </div>

                    <div className="glass overflow-hidden rounded-3xl border border-border/50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border/50 bg-muted/30">
                                        <th className="p-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Reference</th>
                                        <th className="p-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Medical Product</th>
                                        <th className="p-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Transaction Date</th>
                                        <th className="p-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Qty</th>
                                        <th className="p-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Total</th>
                                        <th className="p-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Security</th>
                                        <th className="p-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-20 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-4xl mb-4 opacity-20">📁</span>
                                                    <p className="text-muted-foreground font-medium text-lg">No secure transaction logs found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order, index) => (
                                            <tr key={index} className="hover:bg-primary/[0.02] transition-colors group">
                                                <td className="p-5">
                                                    <span className="text-sm font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                                        {order["Patient ID"]}
                                                    </span>
                                                </td>
                                                <td className="p-5">
                                                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                        {order["Product Name"]}
                                                    </div>
                                                </td>
                                                <td className="p-5 text-sm text-muted-foreground font-medium">
                                                    {formatDate(order["Purchase Date"])}
                                                </td>
                                                <td className="p-5 text-sm text-muted-foreground font-bold">
                                                    {order["Quantity"]}
                                                </td>
                                                <td className="p-5">
                                                    <span className="text-lg font-bold text-foreground">
                                                        €{(order["Total Price (EUR)"] ?? 0).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="p-5">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${order["Prescription Required"] === "Yes"
                                                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                        }`}>
                                                        {order["Prescription Required"] === "Yes" ? "Locked" : "Bypass"}
                                                    </span>
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                        <span className="text-xs font-bold text-primary uppercase tracking-widest">
                                                            Validated
                                                        </span>
                                                    </div>
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

            <footer className="border-t border-border/40 py-12 px-8 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                        <span className="font-bold text-foreground">RxGuardian</span>
                        <span>Archive Terminal</span>
                    </div>
                    <p>© 2026 RxGuardian Technologies. Secured log system.</p>
                </div>
            </footer>
        </div>
    );
}
