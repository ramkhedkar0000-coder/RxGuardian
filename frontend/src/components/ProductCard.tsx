"use client";

import { Product } from "@/types";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();

    return (
        <div className="glass-card h-full flex flex-col group overflow-hidden">
            <div className="relative p-2">
                <div className="h-44 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-primary/5 group-hover:to-primary/10 transition-colors duration-500 overflow-hidden">
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-700 ease-out">💊</span>

                    {/* Subtle inner shadow overlay */}
                    <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.02)] pointer-events-none" />
                </div>

                {/* Sale Badge Example (Optional) */}
                <div className="absolute top-4 right-4 px-2 py-1 bg-white/80 backdrop-blur-md rounded-md text-[10px] font-bold text-primary border border-white/50 shadow-sm">
                    PHARMACY GRADE
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground leading-tight line-clamp-2 min-h-[2.8rem]">
                        {product["product name"]}
                    </h3>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {product["package size"]}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">PZN {product["pzn"]}</span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-6 leading-relaxed">
                    {product["descriptions"]}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/40">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground font-medium">Retail Price</span>
                        <span className="text-xl font-bold text-foreground">
                            €{product["price rec"].toFixed(2)}
                        </span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(product);
                        }}
                        className="bg-primary hover:bg-primary/90 text-white p-2.5 rounded-xl transition-all shadow-md shadow-primary/20 active:scale-95 group/btn"
                    >
                        <span className="flex items-center space-x-2">
                            <span className="text-sm font-semibold px-1">Add</span>
                            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
