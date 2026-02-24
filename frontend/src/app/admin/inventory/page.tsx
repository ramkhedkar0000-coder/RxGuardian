import { Pill, Package, AlertTriangle } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    pzn?: string;
    price: number;
    packageSize?: string;
    description?: string;
    stock: number;
}

async function getProducts(): Promise<Product[]> {
    try {
        const res = await fetch('http://127.0.0.1:3001/api/products', {
            cache: 'no-store',
        });
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
    } catch {
        return [];
    }
}

export default async function InventoryPage() {
    const products = await getProducts();

    const total = products.length;
    const outOf = products.filter(p => p.stock === 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 20).length;
    const inStock = products.filter(p => p.stock >= 20).length;

    const stats = [
        {
            label: 'Total Products',
            value: total,
            icon: <Package className="w-6 h-6" style={{ color: 'var(--color-primary-600)' }} />,
            accent: 'stat-accent-blue',
        },
        {
            label: 'In Stock',
            value: inStock,
            icon: <Pill className="w-6 h-6" style={{ color: 'var(--color-success-600)' }} />,
            accent: 'stat-accent-green',
        },
        {
            label: 'Low Stock',
            value: lowStock,
            icon: <AlertTriangle className="w-6 h-6" style={{ color: 'var(--color-warning-600)' }} />,
            accent: 'stat-accent-amber',
        },
        {
            label: 'Out of Stock',
            value: outOf,
            icon: <Pill className="w-6 h-6" style={{ color: 'var(--color-error-600)' }} />,
            accent: 'stat-accent-red',
        },
    ];

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-neutral-50)' }}>
            <div className="page-wrapper py-8">

                {/* Page header */}
                <div className="mb-6">
                    <h1 className="page-title">Inventory</h1>
                    <p className="page-subtitle">
                        Live stock levels — sourced directly from{' '}
                        <code className="text-xs font-mono" style={{ color: 'var(--color-primary-700)' }}>
                            products-export.xlsx
                        </code>
                    </p>
                </div>

                {/* Low stock warning */}
                {lowStock > 0 && (
                    <div className="alert alert-warning mb-6" role="alert">
                        <AlertTriangle className="alert-icon w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-warning-600)' }} />
                        <div className="alert-content">
                            <p className="alert-title">Low Stock Warning</p>
                            <p className="alert-body">
                                {lowStock} product{lowStock > 1 ? 's are' : ' is'} running low (&lt;20 units).
                                Consider restocking soon.
                            </p>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((s, i) => (
                        <div key={i} className={`stat-card ${s.accent}`}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="stat-card-label">{s.label}</p>
                                {s.icon}
                            </div>
                            <p className="stat-card-value">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Empty state */}
                {total === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <Package className="w-8 h-8" style={{ color: 'var(--color-neutral-400)' }} />
                        </div>
                        <h3 className="empty-state-title">No products found</h3>
                        <p className="empty-state-desc">
                            Make sure the backend is running and{' '}
                            <code className="font-mono text-xs">products-export.xlsx</code>{' '}
                            exists in the backend directory.
                        </p>
                    </div>
                )}

                {/* Table */}
                {total > 0 && (
                    <div className="table-container overflow-x-auto">
                        <div
                            className="px-4 py-3 border-b flex items-center justify-between"
                            style={{
                                borderColor: 'var(--color-neutral-200)',
                                backgroundColor: 'var(--color-neutral-50)',
                            }}
                        >
                            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-neutral-700)' }}>
                                {total} products
                            </h2>
                            <p className="text-xs" style={{ color: 'var(--color-neutral-400)' }}>
                                Auto-refreshes every 30s from Excel
                            </p>
                        </div>

                        <table className="w-full text-left">
                            <thead>
                                <tr>
                                    <th className="table-header-cell">Product Name</th>
                                    <th className="table-header-cell">PZN</th>
                                    <th className="table-header-cell">Package</th>
                                    <th className="table-header-cell text-right">Price</th>
                                    <th className="table-header-cell text-center">Stock</th>
                                    <th className="table-header-cell text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => {
                                    let badgeCls = 'badge-success';
                                    let label = 'In Stock';
                                    if (p.stock === 0) { badgeCls = 'badge-error'; label = 'Out of Stock'; }
                                    else if (p.stock < 20) { badgeCls = 'badge-warning'; label = 'Low Stock'; }

                                    return (
                                        <tr key={p.id} className="table-row">
                                            <td
                                                className="table-cell font-medium"
                                                style={{ color: 'var(--color-neutral-900)', maxWidth: '18rem' }}
                                                title={p.name}
                                            >
                                                <span className="line-clamp-2 block">{p.name}</span>
                                                {p.description && (
                                                    <span
                                                        className="text-xs block mt-0.5 line-clamp-1"
                                                        style={{ color: 'var(--color-neutral-400)' }}
                                                    >
                                                        {p.description}
                                                    </span>
                                                )}
                                            </td>
                                            <td
                                                className="table-cell font-mono text-xs"
                                                style={{ color: 'var(--color-neutral-500)' }}
                                            >
                                                {p.pzn || '—'}
                                            </td>
                                            <td
                                                className="table-cell"
                                                style={{ color: 'var(--color-neutral-600)' }}
                                            >
                                                {p.packageSize || '—'}
                                            </td>
                                            <td
                                                className="table-cell text-right font-semibold"
                                                style={{ color: 'var(--color-neutral-900)' }}
                                            >
                                                {p.price > 0 ? `€${p.price.toFixed(2)}` : 'Free'}
                                            </td>
                                            <td
                                                className="table-cell text-center font-semibold"
                                                style={{
                                                    color: p.stock < 20
                                                        ? 'var(--color-warning-700)'
                                                        : 'var(--color-neutral-700)',
                                                }}
                                            >
                                                {p.stock}
                                            </td>
                                            <td className="table-cell text-center">
                                                <span className={`badge ${badgeCls}`}>{label}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
