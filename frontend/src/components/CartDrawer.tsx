"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function CartDrawer() {
    const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, isCartOpen, setIsCartOpen } = useCart();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity duration-500 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-background/80 backdrop-blur-2xl border-l border-border/50 z-[70] transition-transform duration-500 ease-out shadow-2xl ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-border/40 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Secure Cart</h2>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">
                                {totalItems} Items Encrypted
                            </p>
                        </div>
                        <button
                            onClick={() => setIsCartOpen(false)}
                            className="w-10 h-10 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                        >
                            <span className="text-xl">✕</span>
                        </button>
                    </div>

                    {/* Items */}
                    <div className="flex-grow overflow-y-auto p-6 space-y-6">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                <span className="text-5xl opacity-20">🛒</span>
                                <p className="text-muted-foreground font-medium">Your pharmacy cart is empty.</p>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="text-primary font-bold text-sm uppercase tracking-widest hover:underline"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item["product id"]} className="flex space-x-4 group">
                                    <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-3xl shrink-0">
                                        💊
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-foreground text-sm leading-tight max-w-[140px]">
                                                {item["product name"]}
                                            </h3>
                                            <span className="font-bold text-foreground text-sm">
                                                €{(item["price rec"] * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-medium mt-1">
                                            Retail Unit: €{item["price rec"].toFixed(2)}
                                        </p>

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center space-x-3 bg-muted rounded-lg p-1">
                                                <button
                                                    onClick={() => updateQuantity(item["product id"], item.quantity - 1)}
                                                    className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors font-bold"
                                                >
                                                    −
                                                </button>
                                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item["product id"], item.quantity + 1)}
                                                    className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item["product id"])}
                                                className="text-[10px] font-bold text-muted-foreground hover:text-destructive uppercase tracking-widest transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-border/40 bg-muted/30">
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Subtotal</span>
                                <span className="text-foreground font-bold">€{totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Handling & Security</span>
                                <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest">Free</span>
                            </div>
                            <div className="pt-3 border-t border-border/20 flex justify-between items-end">
                                <span className="text-lg font-bold text-foreground">Total</span>
                                <p className="text-2xl font-black text-foreground">€{totalPrice.toFixed(2)}</p>
                            </div>
                        </div>

                        <button
                            disabled={cart.length === 0}
                            className="w-full py-4 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                        >
                            Checkout Securely
                        </button>
                        <p className="text-center text-[10px] text-muted-foreground font-medium mt-4 uppercase tracking-widest">
                            Verified by AI Guardian Encryption
                        </p>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
