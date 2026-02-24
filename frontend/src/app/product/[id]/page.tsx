"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { Product } from '@/types';
import { Package, ShoppingCart, ArrowLeft, Loader, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { Header } from '@/components/Header';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { addItem } = useCart();
    const { addToast } = useToast();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // In a real app we'd fetch this specific product by ID
                const res = await fetch('http://localhost:3001/api/products');
                if (!res.ok) throw new Error('Failed to fetch data');
                const products: Product[] = await res.json();

                const found = products.find(p => p.id === params.id);
                if (found) {
                    setProduct(found);
                } else {
                    setError('Product not found');
                }
            } catch (err: any) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchProduct();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-slate-950">
                <Header />
                <Loader className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-slate-950 flex flex-col pt-24">
                <Header />
                <div className="max-w-7xl mx-auto px-8 w-full py-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600 mb-6">
                        <Package className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-4">Product Not Found</h1>
                    <p className="text-muted-foreground mb-8">We couldn't find the product you're looking for.</p>
                    <button onClick={() => router.back()} className="btn btn-secondary btn-md">
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        addItem(product);
        addToast({
            type: 'success',
            message: 'Added to Cart',
            description: `${product.name} has been added to your cart.`,
            duration: 2500,
        });
    };

    const stockStatus = product.stock === 0 ? 'out' : product.stock < 15 ? 'low' : 'ok';

    return (
        <div className="min-h-screen flex flex-col font-sans bg-neutral-50 dark:bg-slate-950">
            <Header />

            <main className="flex-grow pt-32 pb-20 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Back Nav */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Catalog
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
                        {/* Product Visual Container */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 flex items-center justify-center aspect-square border border-border/50 shadow-sm relative overflow-hidden group">
                            {/* Decorative background element */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            <Package className="w-48 h-48 text-primary/20 group-hover:scale-105 group-hover:text-primary/40 transition-all duration-700 ease-out" />

                            {/* Badges Overlay */}
                            <div className="absolute top-8 left-8 flex flex-col gap-2">
                                {product.packageSize && (
                                    <span className="badge badge-neutral shadow-sm bg-white/80 backdrop-blur-md">
                                        {product.packageSize}
                                    </span>
                                )}
                                {stockStatus === 'out' && <span className="badge badge-error shadow-sm">Out of Stock</span>}
                                {stockStatus === 'low' && <span className="badge badge-warning shadow-sm">Low Stock</span>}
                            </div>
                        </div>

                        {/* Product Details Container */}
                        <div className="flex flex-col justify-center">
                            {/* Meta */}
                            <div className="mb-4">
                                {product.pzn && (
                                    <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest font-semibold mb-2 flex items-center gap-2">
                                        PZN: {product.pzn}
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    </p>
                                )}
                                <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight text-balance">
                                    {product.name}
                                </h1>
                            </div>

                            {/* Price */}
                            <div className="flex items-end gap-3 mb-8">
                                <span className="text-4xl font-black text-primary">
                                    {product.price > 0 ? `€${product.price.toFixed(2)}` : 'Free'}
                                </span>
                                <span className="text-muted-foreground font-medium mb-1">
                                    per unit
                                </span>
                            </div>

                            {/* Description */}
                            <div className="prose prose-slate dark:prose-invert max-w-none mb-10">
                                <p className="text-lg leading-relaxed text-muted-foreground">
                                    {product.description || 'No detailed description available for this medication.'}
                                </p>
                            </div>

                            {/* Action Area */}
                            <div className="p-8 bg-white dark:bg-slate-900 border border-border/50 rounded-3xl shadow-sm mb-8 space-y-6 relative overflow-hidden">
                                {/* Highlights */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-semibold text-foreground">In Stock</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-semibold text-foreground">Fast Dispatch</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={stockStatus === 'out'}
                                    className="btn btn-primary btn-lg w-full text-lg shadow-primary/25 relative group"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                    <span className="relative flex items-center justify-center gap-2 z-10 w-full text-center">
                                        <ShoppingCart className="w-5 h-5" />
                                        {stockStatus === 'out' ? 'Out of Stock' : 'Add to Secure Cart'}
                                    </span>
                                </button>

                                <p className="text-center text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                                    Encrypted & Verified Transaction
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
