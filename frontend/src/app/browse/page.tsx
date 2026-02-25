"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';
import ChatButton from '@/components/ChatButton';
import { Pill, Search, X } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { Header } from '@/components/Header';

interface Product {
    id: string;
    name: string;
    pzn?: string;
    price: number;
    packageSize?: string;
    description?: string;
    stock: number;
}

function ProductSkeleton() {
    return (
        <div className="card" style={{ padding: '1rem' }}>
            <div className="skeleton" style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', marginBottom: '0.625rem' }} />
            <div className="skeleton" style={{ height: '0.75rem', width: '90%', borderRadius: '0.375rem', marginBottom: '0.3rem' }} />
            <div className="skeleton" style={{ height: '0.75rem', width: '60%', borderRadius: '0.375rem', marginBottom: '0.5rem' }} />
            <div className="skeleton" style={{ height: '0.65rem', width: '100%', borderRadius: '0.375rem', marginBottom: '0.25rem' }} />
            <div className="skeleton" style={{ height: '0.65rem', width: '75%', borderRadius: '0.375rem', marginBottom: '0.625rem' }} />
            <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.625rem' }}>
                <div className="skeleton" style={{ height: '1.25rem', width: '3rem', borderRadius: '9999px' }} />
                <div className="skeleton" style={{ height: '1.25rem', width: '5rem', borderRadius: '9999px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.625rem', borderTop: '1px solid #f1f5f9', marginTop: 'auto' }}>
                <div className="skeleton" style={{ height: '1.25rem', width: '3.5rem', borderRadius: '0.375rem' }} />
                <div className="skeleton" style={{ height: '2rem', width: '4rem', borderRadius: '0.625rem' }} />
            </div>
        </div>
    );
}

const CATEGORIES = ['All', 'Vitamins', 'Antibiotics', 'Pain Relief', 'Cardiac', 'Diabetes'];

export default function BrowsePage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${getApiUrl()}/api/products`, { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed');
            setProducts(await res.json());
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) fetchProducts();
    }, [fetchProducts, user]);

    // Show spinner while auth is resolving
    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-t-teal-600 border-gray-200 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Verifying access...</p>
                </div>
            </div>
        );
    }

    const filtered = products.filter(p => {
        const matchesCategory =
            activeCategory === 'All' ||
            (p.description ?? '').toLowerCase().includes(activeCategory.toLowerCase()) ||
            p.name.toLowerCase().includes(activeCategory.toLowerCase());

        const matchesSearch =
            !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.pzn ?? '').includes(search);

        return matchesCategory && matchesSearch;
    });

    const hasActiveFilters = search !== '' || activeCategory !== 'All';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header />

            {/* Page header */}
            <div className="bg-white border-b border-gray-200">
                <div className="page-wrapper py-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">Medication Catalog</h1>
                            <p className="text-gray-500 text-sm">
                                {loading
                                    ? 'Loading catalog…'
                                    : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} available`}
                            </p>
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="search"
                                placeholder="Search by name or PZN…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow outline-none bg-white"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category chips */}
                    <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                                    activeCategory === cat
                                        ? 'bg-teal-600 text-white shadow-sm'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-400 hover:text-teal-600'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product grid */}
            <div className="page-wrapper py-8 pb-24 flex-1">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Pill className="w-7 h-7 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No medications found</h3>
                        <p className="text-gray-500 text-sm max-w-xs mb-6">
                            {search
                                ? `No results for "${search}"${activeCategory !== 'All' ? ` in ${activeCategory}` : ''}.`
                                : `No products in the ${activeCategory} category.`}
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={() => { setSearch(''); setActiveCategory('All'); }}
                                className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map((product, i) => (
                            <div
                                key={product.id}
                                className="animate-fade-in-up flex flex-col"
                                style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ChatButton />
        </div>
    );
}