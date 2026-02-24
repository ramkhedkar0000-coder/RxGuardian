"use client";

import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { state, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
    const { addToast } = useToast();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Prevent scrolling on body when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleCheckout = async () => {
        if (state.items.length === 0) return;
        setIsCheckingOut(true);

        try {
            // Group items into a single checkout payload if the backend supported it,
            // but for MVP we loop and send individual orders just like before.
            const checkoutPromises = state.items.map(item =>
                fetch('http://localhost:3001/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productName: item.product.name,
                        quantity: item.quantity,
                        price: item.product.price,
                        patientId: 'GUEST-001',
                    }),
                })
            );

            await Promise.all(checkoutPromises);

            clearCart();
            onClose();
            addToast({
                type: 'success',
                message: 'Order Placed Successfully!',
                description: `Successfully processed ${totalItems} items for €${totalPrice.toFixed(2)}.`,
                duration: 5000
            });
        } catch (error) {
            console.error(error);
            addToast({
                type: 'error',
                message: 'Checkout Failed',
                description: 'We encountered an error processing your checkout. Please try again.',
            });
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 right-0 z-[110] w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <ShoppingCart className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Your Cart
                        </h2>
                        {totalItems > 0 && (
                            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                                {totalItems}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {state.items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                            <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-bold text-foreground">Your cart is empty</h3>
                            <p className="text-sm text-muted-foreground max-w-[250px]">
                                Browse our catalog and add medications to proceed with your order.
                            </p>
                            <button onClick={onClose} className="btn btn-outline btn-sm mt-4">
                                Browse Catalog
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {state.items.map((item) => (
                                <div key={item.product.id} className="flex gap-4 group">
                                    <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center flex-shrink-0 border border-border/50">
                                        <span className="text-2xl">💊</span>
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-foreground line-clamp-2 text-sm">
                                                {item.product.name}
                                            </h3>
                                            <p className="font-bold text-foreground text-sm ml-4">
                                                €{(item.product.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            €{item.product.price.toFixed(2)} each
                                        </p>

                                        <div className="flex items-center justify-between mt-auto pt-2">
                                            <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-1 border border-border/50">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded-md transition-shadow text-muted-foreground hover:text-foreground shadow-sm"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="text-sm font-semibold w-4 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded-md transition-shadow text-muted-foreground hover:text-foreground shadow-sm"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.product.id)}
                                                className="p-2 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {state.items.length > 0 && (
                    <div className="p-6 border-t border-border bg-muted/20">
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-semibold">€{totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-emerald-500 font-medium">Free Express</span>
                            </div>
                            <div className="border-t border-border pt-3 flex justify-between items-center">
                                <span className="font-bold text-foreground">Total</span>
                                <span className="text-2xl font-black text-primary">€{totalPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                            className="w-full btn btn-primary btn-lg shadow-primary/25 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                            {isCheckingOut ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing Securely...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 relative z-10">
                                    Secure Checkout
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                        <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-widest font-bold flex items-center justify-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            HIPAA Compliant Processing
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
