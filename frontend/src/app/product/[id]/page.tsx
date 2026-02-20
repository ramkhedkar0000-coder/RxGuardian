import { Header } from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";

async function getProduct(id: string): Promise<Product | null> {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('product id', parseInt(id))
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
    const product = await getProduct(params.id);

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center pt-32">
                    <div className="text-center">
                        <span className="text-6xl mb-6 block">🚫</span>
                        <h1 className="text-2xl font-bold">Medication Not Found</h1>
                        <Link href="/" className="text-primary font-bold mt-4 inline-block hover:underline">
                            Return to Pharmacy
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <Header />

            <main className="flex-grow pt-32 pb-20 px-8">
                <div className="max-w-7xl mx-auto">
                    <Link href="/" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors mb-12 group">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="text-sm font-bold uppercase tracking-widest">Back to Catalog</span>
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Image / Visual Section */}
                        <div className="relative">
                            <div className="aspect-square rounded-[3rem] glass bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-[10rem] shadow-2xl">
                                💊
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-3xl bg-primary/10 backdrop-blur-3xl border border-primary/20 flex flex-col items-center justify-center animate-bounce-slow">
                                <span className="text-xl font-black text-primary">100%</span>
                                <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Verified</span>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex flex-col">
                            <div className="mb-8">
                                <div className="inline-flex items-center space-x-2 bg-muted px-3 py-1 rounded-full mb-4">
                                    <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Pharma Grade Product</span>
                                </div>
                                <h1 className="text-5xl font-bold tracking-tight text-foreground mb-4">
                                    {product["product name"]}
                                </h1>
                                <div className="flex items-center space-x-4">
                                    <span className="text-2xl font-black text-primary">€{(product["price rec"] ?? 0).toFixed(2)}</span>
                                    <span className="px-3 py-1 bg-muted rounded-lg text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        PZN: {product["pzn"]}
                                    </span>
                                </div>
                            </div>

                            <div className="glass p-8 rounded-[2rem] border border-border/50 mb-10">
                                <h2 className="text-sm font-black uppercase tracking-widest text-foreground mb-4 opacity-50">Scientific Overview</h2>
                                <p className="text-muted-foreground leading-relaxed font-medium">
                                    {product["descriptions"] || "No description available for this medication."}
                                </p>

                                <div className="mt-8 grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Packaging</span>
                                        <p className="text-sm font-bold">{product["package size"]}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Status</span>
                                        <p className="text-sm font-bold text-emerald-500">Available</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 w-full">Safety Protocol</p>
                                </div>
                                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="text-primary">🛡️</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">AI Verification Active</p>
                                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                                            This medication is subject to RxGuardian's precision drug interaction monitoring.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12">
                                <AddToCartButton product={product} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
