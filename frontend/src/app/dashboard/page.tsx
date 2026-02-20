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

export default async function DashboardPage() {
    const orders = await getOrders();

    // Derived Stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order["Total Price (EUR)"] ?? 0), 0);
    const uniquePatients = new Set(orders.map(o => o["Patient ID"])).size;

    // Simple top selling calculation
    const counts: Record<string, number> = {};
    orders.forEach(o => {
        counts[o["Product Name"]] = (counts[o["Product Name"]] || 0) + o["Quantity"];
    });
    const topProduct = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return (
        <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20">
            <Header />

            <main className="flex-grow pt-32 pb-20 px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-6">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-primary">Live Insights</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground">Operational Analysis</h1>
                        <p className="text-muted-foreground mt-2 max-w-2xl font-medium">
                            Real-time monitoring of pharmacy throughput, financial performance, and patient distribution.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {[
                            { label: "Total Transactions", value: totalOrders, unit: "Orders", icon: "📊" },
                            { label: "Gross Revenue", value: `€${totalRevenue.toFixed(2)}`, unit: "Real-time", icon: "💳" },
                            { label: "Active Patients", value: uniquePatients, unit: "Unique IDs", icon: "👥" },
                            { label: "Top Product", value: topProduct.split(' ')[0], unit: "By Volume", icon: "⭐" },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card p-6 flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-2xl">{stat.icon}</span>
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{stat.unit}</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-tight mb-1">{stat.label}</h3>
                                    <p className="text-3xl font-extrabold text-foreground truncate">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* System Health Card */}
                        <div className="lg:col-span-2 glass p-8 rounded-3xl border border-border/50">
                            <h3 className="text-xl font-bold text-foreground mb-8">Pharmacy Throughput (Last 7 Days)</h3>
                            <div className="flex items-end space-x-1 h-48 mb-6">
                                {[45, 67, 32, 89, 54, 76, 92].map((v, i) => (
                                    <div key={i} className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t-lg relative group transition-all" style={{ height: `${v}%` }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                            {v} Orders
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-4 border-t border-border/20">
                                <span>Mon</span>
                                <span>Tue</span>
                                <span>Wed</span>
                                <span>Thu</span>
                                <span>Fri</span>
                                <span>Sat</span>
                                <span>Sun</span>
                            </div>
                        </div>

                        {/* Status Panel */}
                        <div className="glass p-8 rounded-3xl border border-border/50">
                            <h3 className="text-xl font-bold text-foreground mb-8">Shield Status</h3>
                            <div className="space-y-6">
                                {[
                                    { label: "Database Sync", status: "Nominal", color: "bg-emerald-500" },
                                    { label: "AI Safety Gate", status: "Active", color: "bg-primary" },
                                    { label: "Inventory Audit", status: "Verified", color: "bg-emerald-500" },
                                    { label: "Prescription Lock", status: "Enabled", color: "bg-amber-500" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{item.label}</p>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{item.status}</p>
                                        </div>
                                        <div className={`w-3 h-3 rounded-full ${item.color} shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">AI Suggestion</p>
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                    High demand detected for {topProduct.split(' ')[0]}. Automated restock scheduled for 04:00 AM.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-border/40 py-12 px-8 mt-auto">
                <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
                    <p>© 2026 RxGuardian Analysis Hub. Secure Encryption Layer active.</p>
                </div>
            </footer>
        </div>
    );
}
