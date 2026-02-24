"use client";

import { useState } from 'react';
import { ShoppingCart, CheckCircle, Loader, Package } from 'lucide-react';

// Normalised product shape from new productService
interface Product {
    id: string;
    name: string;
    pzn?: string;
    price: number;
    packageSize?: string;
    description?: string;
    stock: number;
}

export default function ProductCard({ product }: { product: Product }) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
    const [errMsg, setErrMsg] = useState('');

    const handleAddToCart = async () => {
        setStatus('loading');
        setErrMsg('');
        try {
            const res = await fetch('http://localhost:3001/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: product.name,
                    quantity: 1,
                    price: product.price,
                    patientId: 'GUEST-001',
                }),
            });

            if (!res.ok) throw new Error('Order failed');
            setStatus('done');
            setTimeout(() => setStatus('idle'), 2500);
        } catch (e: any) {
            setErrMsg(e.message || 'Could not place order');
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const stockStatus =
        product.stock === 0 ? 'out' :
            product.stock < 15 ? 'low' : 'ok';

    return (
        <div
            className="card card-hover flex flex-col gap-3"
            style={{ padding: '1.25rem' }}
        >
            {/* Product icon placeholder */}
            <div
                className="flex items-center justify-center w-10 h-10 rounded-lg mb-1"
                style={{ backgroundColor: 'var(--color-primary-50)' }}
            >
                <Package className="w-5 h-5" style={{ color: 'var(--color-primary-600)' }} />
            </div>

            {/* Name */}
            <h3
                className="font-semibold leading-snug line-clamp-2"
                style={{ fontSize: '0.9375rem', color: 'var(--color-neutral-900)' }}
                title={product.name}
            >
                {product.name}
            </h3>

            {/* Description */}
            {product.description && (
                <p
                    className="text-xs line-clamp-2"
                    style={{ color: 'var(--color-neutral-500)' }}
                >
                    {product.description}
                </p>
            )}

            {/* Meta badges row */}
            <div className="flex flex-wrap gap-1.5">
                {product.packageSize && (
                    <span className="badge badge-neutral">{product.packageSize}</span>
                )}
                {product.pzn && (
                    <span
                        className="text-xs font-mono"
                        style={{ color: 'var(--color-neutral-400)' }}
                        title="Pharmazentralnummer"
                    >
                        PZN: {product.pzn}
                    </span>
                )}
            </div>

            {/* Stock badge */}
            <div className="flex items-center gap-2">
                {stockStatus === 'out' && (
                    <span className="badge badge-error">Out of Stock</span>
                )}
                {stockStatus === 'low' && (
                    <span className="badge badge-warning">Low Stock · {product.stock} left</span>
                )}
                {stockStatus === 'ok' && (
                    <span className="badge badge-success">In Stock</span>
                )}
            </div>

            {/* Spacer */}
            <div className="flex-grow" />

            {/* Price + CTA */}
            <div className="flex items-center justify-between mt-auto pt-3"
                style={{ borderTop: '1px solid var(--color-neutral-100)' }}>
                <span
                    className="text-lg font-bold"
                    style={{ color: 'var(--color-neutral-900)' }}
                >
                    {product.price > 0 ? `€${product.price.toFixed(2)}` : 'Free'}
                </span>

                {status === 'error' && (
                    <p className="text-xs" style={{ color: 'var(--color-error-600)' }}>
                        {errMsg}
                    </p>
                )}

                {status !== 'error' && (
                    <button
                        onClick={handleAddToCart}
                        disabled={status !== 'idle' || stockStatus === 'out'}
                        className="btn btn-primary btn-sm"
                        aria-label={`Add ${product.name} to cart`}
                    >
                        {status === 'loading' && (
                            <Loader className="w-4 h-4 animate-spin" aria-hidden />
                        )}
                        {status === 'done' && (
                            <CheckCircle className="w-4 h-4" aria-hidden />
                        )}
                        {status === 'idle' && (
                            <ShoppingCart className="w-4 h-4" aria-hidden />
                        )}
                        {status === 'done' ? 'Ordered!' : 'Add to cart'}
                    </button>
                )}
            </div>
        </div>
    );
}
