import { Product } from "@/types";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="glass-card flex flex-col h-full group relative overflow-hidden backdrop-blur-md bg-white/40 border border-white/20 shadow-xl rounded-2xl">
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="relative z-10 p-4 flex flex-col flex-grow">
                <div className="h-48 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-4xl text-slate-300">💊</span>
                </div>

                <h3 className="text-xl font-bold mb-2 text-slate-800 line-clamp-2 min-h-[3.5rem]">
                    {product["product name"]}
                </h3>

                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        {product["package size"]}
                    </span>
                    <span className="text-xs text-slate-400">PZN: {product["pzn"]}</span>
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-3 flex-grow">
                    {product["descriptions"]}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-200/50">
                    <span className="text-2xl font-bold text-primary">
                        €{product["price rec"].toFixed(2)}
                    </span>
                    <button className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-lg shadow-blue-500/30 active:scale-95">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
