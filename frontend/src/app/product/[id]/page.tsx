"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { Product } from '@/types';
import { Package, ShoppingCart, ArrowLeft, CheckCircle, Shield, Truck, RotateCcw, Star } from 'lucide-react';
import { Header } from '@/components/Header';
import { getApiUrl } from '@/lib/api';

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

function Spinner() {
    return (
        <div className="flex items-center justify-center w-full h-full min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-14 h-14">
                    <div
                        className="animate-spin absolute inset-0 rounded-full border-4 border-t-teal-500"
                        style={{ borderColor: '#e2e8f0', borderTopColor: '#0d9488' }}
                    />
                </div>
                <p className="text-sm font-medium" style={{ color: '#64748b' }}>Loading product…</p>
            </div>
        </div>
    );
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { addItem } = useCart();
    const { addToast } = useToast();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [added, setAdded] = useState(false);
    const [qty, setQty] = useState(1);

    useEffect(() => {
        if (!params.id) return;
        fetch(`${getApiUrl()}/api/products`)
            .then(r => { if (!r.ok) throw new Error('failed'); return r.json(); })
            .then((all: Product[]) => {
                const found = all.find(p => p.id === params.id);
                if (found) setProduct(found);
                else setError('Product not found');
            })
            .catch(() => setError('Failed to load product'))
            .finally(() => setLoading(false));
    }, [params.id]);

    const handleAddToCart = () => {
        if (!product) return;
        for (let i = 0; i < qty; i++) addItem(product);
        addToast({
            type: 'success',
            message: `${product.name} added to cart`,
            description: `${qty} × ${INR.format(product.price)} = ${INR.format(product.price * qty)}`,
            duration: 3000,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const stockStatus = product
        ? product.stock === 0 ? 'out' : product.stock < 10 ? 'low' : 'ok'
        : 'ok';

    if (loading) return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <Header />
            <Spinner />
        </div>
    );

    if (error || !product) return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <Header />
            <div className="page-wrapper py-16 text-center">
                <div className="empty-state">
                    <div className="empty-state-icon"><Package className="w-8 h-8" style={{ color: '#94a3b8' }} /></div>
                    <h1 className="empty-state-title">Product Not Found</h1>
                    <p className="empty-state-desc">{error || 'This medicine is not in our catalog.'}</p>
                    <button onClick={() => router.back()} className="btn btn-secondary btn-md mt-6">
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </button>
                </div>
            </div>
        </div>
    );

    const discount = Math.round(product.price * 0.15);
    const mrp = product.price + discount;

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <Header />

            <main className="page-wrapper py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm mb-6 animate-fade-in" style={{ color: '#94a3b8' }}>
                    <button onClick={() => router.back()} className="hover:text-teal-600 transition-colors flex items-center gap-1">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back
                    </button>
                    <span>/</span>
                    <span>Medicines</span>
                    <span>/</span>
                    <span className="truncate max-w-xs" style={{ color: '#334155' }}>{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14">
                    {/* ── Image Panel ── */}
                    <div className="animate-fade-in-left">
                        <div
                            className="rounded-3xl flex items-center justify-center relative overflow-hidden"
                            style={{
                                aspectRatio: '1 / 1',
                                background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)',
                                border: '1px solid #e2e8f0',
                            }}
                        >
                            <div
                                className="absolute inset-0 opacity-40"
                                style={{
                                    backgroundImage: 'radial-gradient(ellipse at top right, rgba(13,148,136,0.15), transparent 60%)',
                                }}
                            />
                            <Package
                                className="animate-float"
                                style={{ width: '10rem', height: '10rem', color: '#0d9488', opacity: 0.35 }}
                            />

                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {stockStatus === 'low' && (
                                    <span className="badge badge-warning">Only {product.stock} left</span>
                                )}
                                {stockStatus === 'out' && (
                                    <span className="badge badge-error">Out of Stock</span>
                                )}
                                {discount > 0 && stockStatus !== 'out' && (
                                    <span className="badge badge-teal">15% OFF</span>
                                )}
                            </div>
                        </div>

                        {/* Trust icons below */}
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            {[
                                { icon: <Shield className="w-4 h-4" />, label: 'Genuine Medicine', color: '#0d9488' },
                                { icon: <Truck className="w-4 h-4" />, label: 'Free Delivery', color: '#4f46e5' },
                                { icon: <RotateCcw className="w-4 h-4" />, label: 'Easy Returns', color: '#ea580c' },
                            ].map(t => (
                                <div
                                    key={t.label}
                                    className="flex flex-col items-center gap-1.5 rounded-xl py-3 text-center"
                                    style={{ background: '#ffffff', border: '1px solid #f1f5f9' }}
                                >
                                    <span style={{ color: t.color }}>{t.icon}</span>
                                    <span className="text-[11px] font-semibold" style={{ color: '#475569' }}>{t.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Detail Panel ── */}
                    <div className="animate-fade-in-up flex flex-col">
                        {/* PZN */}
                        {product.pzn && (
                            <p className="text-xs font-mono font-semibold mb-2 uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                                PZN: {product.pzn}
                            </p>
                        )}

                        <h1
                            className="font-black leading-tight mb-2"
                            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', letterSpacing: '-0.035em', color: '#0f172a' }}
                        >
                            {product.name}
                        </h1>

                        {/* Rating (demo) */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <Star
                                        key={n}
                                        className="w-4 h-4"
                                        fill={n <= 4 ? '#f97316' : 'none'}
                                        style={{ color: '#f97316' }}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-semibold" style={{ color: '#0f172a' }}>4.2</span>
                            <span className="text-sm" style={{ color: '#64748b' }}>(156 reviews)</span>
                        </div>

                        {/* Price */}
                        <div
                            className="rounded-2xl p-4 mb-5"
                            style={{ background: '#f0fdfa', border: '1px solid #ccfbf1' }}
                        >
                            <div className="flex items-baseline gap-3 mb-1">
                                <span className="font-black text-3xl" style={{ color: '#0d9488' }}>
                                    {product.price > 0 ? INR.format(product.price) : 'Free'}
                                </span>
                                {product.price > 0 && (
                                    <>
                                        <span className="text-lg line-through" style={{ color: '#94a3b8' }}>
                                            {INR.format(mrp)}
                                        </span>
                                        <span className="badge badge-teal">15% OFF</span>
                                    </>
                                )}
                            </div>
                            <p className="text-xs" style={{ color: '#64748b' }}>
                                Inclusive of all taxes · Free delivery on this item
                            </p>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="mb-5">
                                <h3 className="font-semibold mb-2 text-sm" style={{ color: '#0f172a' }}>Description</h3>
                                <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{product.description}</p>
                            </div>
                        )}

                        {/* Meta */}
                        {product.packageSize && (
                            <div className="flex items-center gap-2 mb-5">
                                <span className="text-sm font-medium" style={{ color: '#64748b' }}>Pack Size:</span>
                                <span className="badge badge-neutral text-xs">{product.packageSize}</span>
                            </div>
                        )}

                        {/* Quantity */}
                        {stockStatus !== 'out' && (
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-sm font-medium" style={{ color: '#475569' }}>Qty:</span>
                                <div className="flex items-center gap-2 rounded-xl border px-3 py-1.5" style={{ borderColor: '#e2e8f0' }}>
                                    <button
                                        onClick={() => setQty(q => Math.max(1, q - 1))}
                                        className="w-6 h-6 flex items-center justify-center rounded-lg text-lg font-bold hover:bg-slate-100 transition-colors"
                                        style={{ color: '#0d9488' }}
                                    >
                                        −
                                    </button>
                                    <span className="w-8 text-center font-bold text-base" style={{ color: '#0f172a' }}>{qty}</span>
                                    <button
                                        onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                                        className="w-6 h-6 flex items-center justify-center rounded-lg text-lg font-bold hover:bg-slate-100 transition-colors"
                                        style={{ color: '#0d9488' }}
                                    >
                                        +
                                    </button>
                                </div>
                                {qty > 1 && (
                                    <span className="text-sm font-semibold" style={{ color: '#0d9488' }}>
                                        = {INR.format(product.price * qty)}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* CTA */}
                        <button
                            onClick={handleAddToCart}
                            disabled={stockStatus === 'out' || added}
                            className="btn btn-lg w-full mb-3"
                            style={added
                                ? { background: '#16a34a', color: '#fff' }
                                : stockStatus === 'out'
                                    ? { background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }
                                    : { background: 'linear-gradient(135deg, #0d9488, #0f766e)', color: '#fff', boxShadow: '0 4px 20px rgba(13,148,136,0.4)' }
                            }
                        >
                            {added ? (
                                <><CheckCircle className="w-5 h-5" style={{ animation: 'scaleIn 0.25s ease-out' }} /> Added to Cart!</>
                            ) : stockStatus === 'out' ? (
                                'Out of Stock'
                            ) : (
                                <><ShoppingCart className="w-5 h-5" /> Add to Cart · {INR.format(product.price * qty)}</>
                            )}
                        </button>

                        <p className="text-xs text-center" style={{ color: '#94a3b8' }}>
                            🔒 100% Secure Checkout · HIPAA Compliant
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
