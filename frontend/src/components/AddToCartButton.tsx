"use client";

import { useCart } from "@/context/CartContext";
import { Product } from "@/types";

export function AddToCartButton({ product }: { product: Product }) {
    const { addToCart } = useCart();

    return (
        <button
            onClick={() => addToCart(product)}
            className="w-full py-5 bg-primary hover:bg-primary/90 text-white rounded-3xl font-bold transition-all shadow-2xl shadow-primary/20 flex items-center justify-center space-x-4 active:scale-[0.98] group"
        >
            <span className="text-xl">🛒</span>
            <span>Add Securely to Cart</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
    );
}
