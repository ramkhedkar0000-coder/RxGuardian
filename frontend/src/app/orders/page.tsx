"use client";

import { useEffect, useState } from 'react';
import { Package, CheckCircle, Clock, CreditCard } from 'lucide-react';

interface Order {
    id?: string;
    "Product Name": string;
    "Purchase Date": number | string;
    _purchaseDateISO?: string;
    "Quantity": number;
    "Total Price (EUR)": number;
    status?: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3001/api/orders')
            .then(r => r.json())
            .then(d => { setOrders(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const formatDate = (order: Order) => {
        if (order._purchaseDateISO) return new Date(order._purchaseDateISO).toLocaleDateString();
        const d = order["Purchase Date"];
        if (typeof d === 'number') return new Date((d - 25569) * 86400 * 1000).toLocaleDateString();
        return d ? new Date(d as string).toLocaleDateString() : 'N/A';
    };

    const getStatusBadge = (s: string) => {
        const sl = (s || 'Pending').toLowerCase();
        if (sl === 'completed' || sl === 'delivered') return 'badge-success';
        if (sl === 'cancelled') return 'badge-error';
        if (sl === 'processing') return 'badge-info';
        return 'badge-neutral';
    };

    const totalSpend = orders.reduce((sum, o) => sum + (o["Total Price (EUR)"] || 0), 0);
    const completed = orders.filter(o => (o.status || '').toLowerCase() === 'completed').length;

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
            label: 'Total Spend',
            value: loading ? '—' : `€${totalSpend.toFixed(2)}`,
            icon: <CreditCard className="w-6 h-6" style={{ color: 'var(--color-warning-600)' }} />,
            accent: 'stat-accent-amber',
        },
    ];

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-neutral-50)' }}>
            <div className="page-wrapper py-8">

                <div className="mb-6">
                    <h1 className="page-title">My Orders</h1>
                    <p className="page-subtitle">Your complete medication order history</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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

                {/* Table */}
                <div className="table-container">
                    <div
                        className="px-4 py-3 border-b flex items-center gap-2"
                        style={{ borderColor: 'var(--color-neutral-200)', backgroundColor: 'var(--color-neutral-50)' }}
                    >
                        <Clock className="w-4 h-4" style={{ color: 'var(--color-neutral-400)' }} />
                        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-neutral-700)' }}>Order History</h2>
                    </div>

                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="table-header-cell">Date</th>
                                <th className="table-header-cell">Medication</th>
                                <th className="table-header-cell text-center">Qty</th>
                                <th className="table-header-cell text-right">Total</th>
                                <th className="table-header-cell text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="table-row">
                                        {[1, 2, 3, 4, 5].map(j => (
                                            <td key={j} className="table-cell">
                                                <div className="skeleton h-4 w-full" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon">
                                                <Package className="w-8 h-8" style={{ color: 'var(--color-neutral-400)' }} />
                                            </div>
                                            <h3 className="empty-state-title">No orders yet</h3>
                                            <p className="empty-state-desc">
                                                When you place an order, it will appear here.
                                            </p>
                                            <a href="/" className="btn btn-primary btn-md">
                                                Browse Medications
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order, idx) => (
                                    <tr key={idx} className="table-row">
                                        <td className="table-cell" style={{ color: 'var(--color-neutral-500)' }}>
                                            {formatDate(order)}
                                        </td>
                                        <td className="table-cell font-medium" style={{ color: 'var(--color-neutral-900)', fontSize: '0.9375rem' }}>
                                            {order["Product Name"]}
                                        </td>
                                        <td className="table-cell text-center">{order["Quantity"]}</td>
                                        <td className="table-cell text-right font-semibold" style={{ color: 'var(--color-neutral-900)' }}>
                                            €{(order["Total Price (EUR)"] || 0).toFixed(2)}
                                        </td>
                                        <td className="table-cell text-center">
                                            <span className={`badge ${getStatusBadge(order.status || '')}`}>
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
