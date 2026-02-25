"use client";

import Link from 'next/link';
import { ShoppingCart, Package, CheckCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { Product } from '@/types';
import { useState } from 'react';

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

// Fixed line-clamp height helpers for equal card heights
const clamp2: React.CSSProperties = {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
};

export default function ProductCard({ product }: { product: Product }) {
    const { addItem } = useCart();
    const { addToast } = useToast();
    const [added, setAdded] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (stockStatus === 'out') return;
        addItem(product);
        addToast({
            type: 'success',
            message: `Added to cart`,
            description: `${product.name} · ${INR.format(product.price)}`,
            duration: 2500,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
    };

    const stockStatus =
        product.stock === 0 ? 'out' :
            product.stock < 10 ? 'low' : 'ok';

    return (
        <Link
            href={`/product/${product.id}`}
            className="card card-hover flex flex-col group"
            style={{ padding: '1rem', textDecoration: 'none' }}
        >
            {/* Row 1: icon + stock badge */}
            <div className="flex items-start justify-between mb-2.5">
                <div
                    className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)' }}
                >
                    <Package style={{ width: '1rem', height: '1rem', color: '#0d9488' }} />
                </div>

                <div className="flex-shrink-0 ml-2 pt-0.5">
                    {stockStatus === 'out' && (
                        <span className="badge badge-error">Out of Stock</span>
                    )}
                    {stockStatus === 'low' && (
                        <span className="badge badge-warning">{product.stock} left</span>
                    )}
                    {stockStatus === 'ok' && (
                        <span className="flex items-center gap-1" style={{ fontSize: '0.7rem', fontWeight: 600, color: '#16a34a' }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                            In Stock
                        </span>
                    )}
                </div>
            </div>

            {/* Row 2: Name — FIXED 2-line height always */}
            <h3
                title={product.name}
                style={{
                    ...clamp2,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    lineHeight: '1.4',
                    minHeight: '2.38rem', // exactly 2 lines at 0.85rem × 1.4
                    marginBottom: '0.375rem',
                    transition: 'color 0.15s',
                }}
                className="group-hover:text-teal-600"
            >
                {product.name}
            </h3>

            {/* Row 3: Description — FIXED 2-line height always */}
            <p
                style={{
                    ...clamp2,
                    fontSize: '0.775rem',
                    color: '#64748b',
                    lineHeight: '1.5',
                    minHeight: '2.325rem', // exactly 2 lines
                    marginBottom: '0.5rem',
                }}
            >
                {product.description || '\u00a0'}
            </p>

            {/* Row 4: Meta — single line, no wrap */}
            <div
                className="flex items-center gap-1.5 overflow-hidden"
                style={{ minHeight: '1.375rem', marginBottom: '0.5rem', flexWrap: 'nowrap' }}
            >
                {product.packageSize && (
                    <span className="badge badge-neutral flex-shrink-0" style={{ fontSize: '0.68rem' }}>
                        {product.packageSize}
                    </span>
                )}
                {product.pzn && (
                    <span
                        className="badge badge-neutral font-mono flex-shrink-0"
                        style={{ fontSize: '0.65rem', maxWidth: '8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                        PZN·{product.pzn}
                    </span>
                )}
            </div>

            {/* Spacer — pushes price to bottom */}
            <div style={{ flex: 1 }} />

            {/* Row 5: Price + CTA — always at bottom */}
            <div
                className="flex items-center justify-between"
                style={{ paddingTop: '0.625rem', borderTop: '1px solid #f1f5f9' }}
            >
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    {product.price > 0
                        ? INR.format(product.price)
                        : <span style={{ color: '#16a34a' }}>Free</span>
                    }
                </span>

                <button
                    onClick={handleAddToCart}
                    disabled={stockStatus === 'out'}
                    className={`btn btn-sm flex-shrink-0 ${!added && stockStatus !== 'out' ? 'btn-primary' : ''}`}
                    style={
                        added
                            ? { background: '#16a34a', color: '#fff' }
                            : stockStatus === 'out'
                                ? { background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }
                                : undefined
                    }
                    aria-label={`Add ${product.name} to cart`}
                >
                    {added
                        ? <><CheckCircle style={{ width: '0.8rem', height: '0.8rem' }} /> Added!</>
                        : <><ShoppingCart style={{ width: '0.8rem', height: '0.8rem' }} /> Add</>
                    }
                </button>
            </div>
        </Link>
    );
}
