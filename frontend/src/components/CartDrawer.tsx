"use client";

import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Package, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getApiUrl } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useEffect, useRef, useState } from 'react';

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { state, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
    const items = state.items;
    const { addToast } = useToast();
    const [checking, setChecking] = useState(false);
    const drawerRef = useRef<HTMLDivElement>(null);

    /* close on Escape */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    /* lock body scroll when open */
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleCheckout = async () => {
        if (items.length === 0) return;
        setChecking(true);
        try {
            const res = await fetch(`${getApiUrl()}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map((i: { product: { id: string }; quantity: number }) => ({ productId: i.product.id, quantity: i.quantity })),
                    totalAmount: totalPrice,
                }),
            });
            if (!res.ok) throw new Error('Order failed');
            clearCart();
            onClose();
            addToast({
                type: 'success',
                message: 'Order Placed!',
                description: `Your order of ${INR.format(totalPrice)} has been placed successfully.`,
                duration: 5000,
            });
        } catch {
            addToast({
                type: 'error',
                message: 'Checkout Failed',
                description: 'Could not place order. Please try again.',
                duration: 4000,
            });
        } finally {
            setChecking(false);
        }
    };

    const savings = Math.round(totalPrice * 0.18); // simulated 18% GST saving display

    return (
        <div aria-modal="true" role="dialog" aria-label="Shopping Cart">
            {/* Backdrop */}
            <div
                className="fixed inset-0 transition-opacity duration-300"
                style={{
                    backgroundColor: 'rgba(15,23,42,0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 49,
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                }}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className="fixed right-0 top-0 h-full flex flex-col"
                style={{
                    width: 'min(420px, 100vw)',
                    zIndex: 50,
                    background: '#ffffff',
                    boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                >
                    <div className="flex items-center gap-2.5">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #0d9488, #4f46e5)' }}
                        >
                            <ShoppingBag className="text-white" style={{ width: '1rem', height: '1rem' }} />
                        </div>
                        <div>
                            <h2 className="font-bold text-base" style={{ color: '#0f172a' }}>Your Cart</h2>
                            <p className="text-xs" style={{ color: '#94a3b8' }}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        style={{ color: '#64748b' }}
                        aria-label="Close cart"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto py-4 px-5">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div
                                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                                style={{ background: '#f0fdfa' }}
                            >
                                <ShoppingBag style={{ width: '2.25rem', height: '2.25rem', color: '#0d9488' }} />
                            </div>
                            <p className="font-bold text-lg" style={{ color: '#0f172a' }}>Your cart is empty</p>
                            <p className="text-sm mt-1" style={{ color: '#64748b' }}>Browse our catalog and add medicines</p>
                            <button onClick={onClose} className="btn btn-primary btn-sm mt-6">
                                Browse Medicines
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map(item => (
                                <div
                                    key={item.product.id}
                                    className="flex gap-3 rounded-xl p-3 transition-colors"
                                    style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
                                >
                                    {/* Icon */}
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)' }}
                                    >
                                        <Package className="w-5 h-5" style={{ color: '#0d9488' }} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm leading-snug truncate" style={{ color: '#0f172a' }}>
                                            {item.product.name}
                                        </p>
                                        <p className="text-xs mt-0.5 font-bold" style={{ color: '#0d9488' }}>
                                            {INR.format(item.product.price)} each
                                        </p>
                                        {/* Qty controls */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                className="w-6 h-6 rounded-md flex items-center justify-center border transition-colors hover:bg-white"
                                                style={{ borderColor: '#e2e8f0', color: '#64748b' }}
                                                aria-label="Decrease"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-7 text-center text-sm font-bold" style={{ color: '#0f172a' }}>
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                className="w-6 h-6 rounded-md flex items-center justify-center border transition-colors hover:bg-white"
                                                style={{ borderColor: '#e2e8f0', color: '#64748b' }}
                                                aria-label="Increase"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Sub-total + delete */}
                                    <div className="flex flex-col items-end justify-between flex-shrink-0">
                                        <span className="font-black text-sm" style={{ color: '#0f172a' }}>
                                            {INR.format(item.product.price * item.quantity)}
                                        </span>
                                        <button
                                            onClick={() => removeItem(item.product.id)}
                                            className="p-1 rounded-lg hover:bg-red-50 transition-colors"
                                            style={{ color: '#94a3b8' }}
                                            aria-label="Remove"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 hover:text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div
                        className="px-5 py-4 flex-shrink-0 space-y-3"
                        style={{ borderTop: '1px solid #f1f5f9' }}
                    >
                        {/* Price summary */}
                        <div className="rounded-xl p-4 space-y-2" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                            <div className="flex items-center justify-between text-sm">
                                <span style={{ color: '#64748b' }}>Subtotal ({totalItems} items)</span>
                                <span className="font-semibold" style={{ color: '#0f172a' }}>{INR.format(totalPrice)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span style={{ color: '#64748b' }}>Delivery</span>
                                <span className="font-semibold" style={{ color: '#16a34a' }}>FREE</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold" style={{ color: '#0f172a' }}>You save</span>
                                <span className="font-semibold" style={{ color: '#0d9488' }}>~{INR.format(savings)}</span>
                            </div>
                            <div
                                className="flex items-center justify-between pt-2 mt-1"
                                style={{ borderTop: '1px dashed #e2e8f0' }}
                            >
                                <span className="font-bold text-base" style={{ color: '#0f172a' }}>Total Payable</span>
                                <span className="font-black text-lg" style={{ color: '#0d9488' }}>{INR.format(totalPrice)}</span>
                            </div>
                        </div>

                        {/* Trust */}
                        <div className="flex items-center justify-center gap-1.5 text-xs" style={{ color: '#64748b' }}>
                            <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#0d9488' }} />
                            Secure checkout · HIPAA compliant
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={checking}
                            className="btn btn-primary btn-lg w-full"
                        >
                            {checking ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Placing Order…
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Place Order · {INR.format(totalPrice)}
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => { clearCart(); }}
                            className="btn btn-ghost btn-sm w-full text-xs"
                            style={{ color: '#94a3b8' }}
                        >
                            Clear cart
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
