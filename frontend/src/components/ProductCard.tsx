"use client";

import Link from 'next/link';
import { ShoppingCart, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

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
    const { addItem } = useCart();
    const { addToast } = useToast();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent navigating to product details when clicking add to cart
        addItem(product);
        addToast({
            type: 'success',
            message: 'Added to Cart',
            description: `${product.name} has been added to your cart.`,
            duration: 2500,
        });
    };

    const stockStatus =
        product.stock === 0 ? 'out' :
            product.stock < 15 ? 'low' : 'ok';

    return (
        <Link
            href={`/product/${product.id}`}
            className="card card-hover flex flex-col gap-3 group"
            style={{ padding: '1.25rem', textDecoration: 'none' }}
        >
            {/* Product icon placeholder */}
            <div
                className="flex items-center justify-center w-10 h-10 rounded-lg mb-1 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: 'var(--color-primary-50)' }}
            >
                <Package className="w-5 h-5" style={{ color: 'var(--color-primary-600)' }} />
            </div>

            {/* Name */}
            <h3
                className="font-semibold leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors"
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

                <button
                    onClick={handleAddToCart}
                    disabled={stockStatus === 'out'}
                    className="btn btn-primary btn-sm"
                    aria-label={`Add ${product.name} to cart`}
                >
                    <ShoppingCart className="w-4 h-4" aria-hidden />
                    Add to cart
                </button>
            </div>
        </Link>
    );
}
