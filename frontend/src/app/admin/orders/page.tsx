"use client";

import { useEffect, useState } from 'react';
import { Package, CheckCircle, Clock, Users, Search } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface Order {
    id?: string;
    "Product Name"?: string;
    "Purchase Date"?: number | string;
    _purchaseDateISO?: string;
    "Quantity"?: number;
    "Total Price (EUR)"?: number;
    status?: string;
    "Patient ID"?: string;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(`${getApiUrl()}/api/orders`)
            .then(r => r.json())
            .then(d => { setOrders(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const formatDate = (order: Order) => {
        if (order._purchaseDateISO) return new Date(order._purchaseDateISO).toLocaleDateString();
        const d = order["Purchase Date"];
        if (!d) return 'N/A';
        if (typeof d === 'number') return new Date((d - 25569) * 86400 * 1000).toLocaleDateString();
        return new Date(d as string).toLocaleDateString();
    };

    const getStatusBadge = (s?: string) => {
        const sl = (s || 'Pending').toLowerCase();
        if (sl === 'completed' || sl === 'delivered') return 'badge-success';
        if (sl === 'cancelled') return 'badge-error';
        if (sl === 'processing') return 'badge-info';
        return 'badge-neutral';
    };

    const filtered = orders.filter(o =>
        !search ||
        (o["Product Name"] || '').toLowerCase().includes(search.toLowerCase()) ||
        (o["Patient ID"] || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.status || '').toLowerCase().includes(search.toLowerCase())
    );

    const completed = orders.filter(o => (o.status || '').toLowerCase() === 'completed').length;
    const pending = orders.filter(o => !o.status || o.status.toLowerCase() === 'pending').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o["Total Price (EUR)"] || 0), 0);

    const stats = [
        {
            label: 'Total Orders',
            value: loading ? '—' : orders.length.toString(),
            icon: <Package className="w-6 h-6" style={{ color: 'var(--color-primary-600)' }} />,
            accent: 'stat-accent-blue',
        },
        {
            label: 'Completed',
            value: loading ? '—' : completed.toString(),
            icon: <CheckCircle className="w-6 h-6" style={{ color: 'var(--color-success-600)' }} />,
            accent: 'stat-accent-green',
        },
        {
            label: 'Pending',
            value: loading ? '—' : pending.toString(),
            icon: <Clock className="w-6 h-6" style={{ color: 'var(--color-warning-600)' }} />,
            accent: 'stat-accent-amber',
        },
        {
            label: 'Total Revenue',
            value: loading ? '—' : `€${totalRevenue.toFixed(2)}`,
            icon: <Users className="w-6 h-6" style={{ color: 'var(--color-primary-600)' }} />,
            accent: 'stat-accent-blue',
        },
    ];

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-neutral-50)' }}>
            <div className="page-wrapper py-8">

                {/* Page header */}
                <div className="mb-6">
                    <h1 className="page-title">Orders Management</h1>
                    <p className="page-subtitle">All patient medication orders across the platform</p>
                </div>

                {/* Stat cards */}
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

                {/* Toolbar: search + result count */}
                <div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4"
                >
                    <p className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>
                        {loading ? 'Loading…' : `Showing ${filtered.length} of ${orders.length} orders`}
                    </p>

                    <div className="relative w-full sm:w-72">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="w-4 h-4" style={{ color: 'var(--color-neutral-400)' }} />
                        </div>
                        <input
                            type="search"
                            placeholder="Search by product or patient…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="input pl-9"
                        />
                    </div>
                </div>

                {/* Orders table */}
                <div className="table-container overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="table-header-cell">Date</th>
                                <th className="table-header-cell">Patient</th>
                                <th className="table-header-cell">Product</th>
                                <th className="table-header-cell text-center">Qty</th>
                                <th className="table-header-cell text-right">Total</th>
                                <th className="table-header-cell text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="table-row">
                                        {[1, 2, 3, 4, 5, 6].map(j => (
                                            <td key={j} className="table-cell">
                                                <div className="skeleton h-4 w-full" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon">
                                                <Package className="w-8 h-8" style={{ color: 'var(--color-neutral-400)' }} />
                                            </div>
                                            <h3 className="empty-state-title">
                                                {search ? 'No matching orders' : 'No orders yet'}
                                            </h3>
                                            <p className="empty-state-desc">
                                                {search
                                                    ? `No orders match "${search}". Try a different search term.`
                                                    : 'Orders placed by patients will appear here.'}
                                            </p>
                                            {search && (
                                                <button
                                                    className="btn btn-secondary btn-md"
                                                    onClick={() => setSearch('')}
                                                >
                                                    Clear search
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((order, idx) => (
                                    <tr key={idx} className="table-row">
                                        <td className="table-cell" style={{ color: 'var(--color-neutral-500)', whiteSpace: 'nowrap' }}>
                                            {formatDate(order)}
                                        </td>
                                        <td className="table-cell font-mono text-xs" style={{ color: 'var(--color-neutral-600)' }}>
                                            {order["Patient ID"] || '—'}
                                        </td>
                                        <td
                                            className="table-cell font-medium"
                                            style={{
                                                color: 'var(--color-neutral-900)',
                                                fontSize: '0.9375rem',
                                                maxWidth: '14rem',
                                            }}
                                            title={order["Product Name"]}
                                        >
                                            {order["Product Name"] || '—'}
                                        </td>
                                        <td className="table-cell text-center" style={{ color: 'var(--color-neutral-700)' }}>
                                            {order["Quantity"] ?? '—'}
                                        </td>
                                        <td className="table-cell text-right font-semibold" style={{ color: 'var(--color-neutral-900)' }}>
                                            €{(order["Total Price (EUR)"] || 0).toFixed(2)}
                                        </td>
                                        <td className="table-cell text-center">
                                            <span className={`badge ${getStatusBadge(order.status)}`}>
                                                {order.status || 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
