"use client";

import { useEffect, useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface RefillAlert {
    patient_id: string;
    medication: string;
    last_order_date: string;
    days_since_last_order: number;
    days_supply: number;
    dosage_frequency: string;
    recommendation: string;
}

export default function DashboardPage() {
    const [alerts, setAlerts] = useState<RefillAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${getApiUrl()}/api/refill-alerts`)
            .then(r => r.json())
            .then(d => { setAlerts(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const urgent = alerts.filter(a => a.days_since_last_order > a.days_supply);
    const regular = alerts.filter(a => a.days_since_last_order <= a.days_supply);

    const notify = async (alertData: RefillAlert) => {
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

        try {
            // Reconstruct the expected RefillAlert object for the backend service
            // Note: The backend service expects keys: patientId, productName, expectedRefillDate, etc.
            // But here we only have the mapped data from GET /api/refill-alerts.
            // However, the backend /api/notify-refill expects an 'alert' object.
            // Let's adapt the data structure to match what sendRefillReminder needs, as best as we can.
            // Actually, looking at sendRefillReminder, it uses: alert.patientId, alert.productName, alert.expectedRefillDate

            // Calculate expected refill date roughly
            const lastDate = new Date(alertData.last_order_date);
            const expectedDate = new Date(lastDate);
            expectedDate.setDate(expectedDate.getDate() + alertData.days_supply);

            const payload = {
                alert: {
                    patientId: alertData.patient_id,
                    productName: alertData.medication,
                    expectedRefillDate: expectedDate.toISOString(),
                    // Other fields might be optional or we can mock them if needed for the log message
                },
                channel: 'EMAIL'
            };

            const res = await fetch(`${getApiUrl()}/api/notify-refill`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                window.alert(`Refill notification sent to patient ${alertData.patient_id}`);
            } else {
                throw new Error('Failed to send');
            }
        } catch (e) {
            window.alert('Failed to send notification. Please try again.');
            console.error(e);
        }
    };

    const stats = [
        {
            label: 'Total Alerts',
            value: alerts.length,
            icon: <Bell className="w-6 h-6" style={{ color: 'var(--color-primary-600)' }} />,
            accent: 'stat-accent-blue',
            valueColor: 'var(--color-neutral-900)',
        },
        {
            label: 'Urgent (>Days Supply)',
            value: urgent.length,
            icon: <AlertTriangle className="w-6 h-6" style={{ color: 'var(--color-warning-600)' }} />,
            accent: 'stat-accent-amber',
            valueColor: urgent.length > 0 ? 'var(--color-warning-700)' : 'var(--color-neutral-900)',
        },
        {
            label: 'Regular Monitoring',
            value: regular.length,
            icon: <CheckCircle className="w-6 h-6" style={{ color: 'var(--color-success-600)' }} />,
            accent: 'stat-accent-green',
            valueColor: 'var(--color-success-700)',
        },
    ];

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-neutral-50)' }}>
            <div className="page-wrapper py-8">

                {/* Page header */}
                <div className="mb-6">
                    <h1 className="page-title">Refill Alerts Dashboard</h1>
                    <p className="page-subtitle">Monitor patients who may need medication refills</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {stats.map((s, i) => (
                        <div key={i} className={`stat-card ${s.accent}`}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="stat-card-label">{s.label}</p>
                                {s.icon}
                            </div>
                            <p className="stat-card-value" style={{ color: s.valueColor }}>
                                {loading ? (
                                    <span className="skeleton inline-block h-8 w-12 rounded" />
                                ) : s.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Urgent alerts */}
                {!loading && urgent.length > 0 && (
                    <div className="mb-4">
                        <div className="alert alert-warning mb-4">
                            <AlertTriangle className="alert-icon" style={{ color: 'var(--color-warning-600)' }} />
                            <div className="alert-content">
                                <h4 className="alert-title" style={{ color: 'var(--color-warning-900)' }}>
                                    {urgent.length} urgent {urgent.length === 1 ? 'alert' : 'alerts'} — overdue for refill
                                </h4>
                                <p className="alert-body" style={{ color: 'var(--color-warning-700)' }}>
                                    These patients may be at risk of missed doses.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alerts table */}
                <div className="table-container">
                    <div
                        className="px-4 py-3 border-b flex items-center gap-2"
                        style={{ borderColor: 'var(--color-neutral-200)', backgroundColor: 'var(--color-neutral-50)' }}
                    >
                        <Package className="w-4 h-4" style={{ color: 'var(--color-neutral-400)' }} />
                        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-neutral-700)' }}>
                            All Refill Alerts
                        </h2>
                    </div>

                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="table-header-cell">Patient ID</th>
                                <th className="table-header-cell">Medication</th>
                                <th className="table-header-cell">Last Order</th>
                                <th className="table-header-cell text-center">Days Since</th>
                                <th className="table-header-cell text-center">Supply (Days)</th>
                                <th className="table-header-cell">Status</th>
                                <th className="table-header-cell text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <tr key={i} className="table-row">
                                        {[1, 2, 3, 4, 5, 6, 7].map(j => (
                                            <td key={j} className="table-cell">
                                                <div className="skeleton h-4 w-full" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : alerts.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon">
                                                <Bell className="w-8 h-8" style={{ color: 'var(--color-neutral-400)' }} />
                                            </div>
                                            <h3 className="empty-state-title">No refill alerts</h3>
                                            <p className="empty-state-desc">
                                                All patients are up to date with their medications.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                alerts.map((alert, idx) => {
                                    const isUrgent = alert.days_since_last_order > alert.days_supply;
                                    return (
                                        <tr key={idx} className="table-row">
                                            <td className="table-cell font-medium" style={{ color: 'var(--color-neutral-900)' }}>
                                                {alert.patient_id}
                                            </td>
                                            <td className="table-cell font-medium" style={{ color: 'var(--color-neutral-900)', fontSize: '0.9375rem' }}>
                                                {alert.medication}
                                            </td>
                                            <td className="table-cell" style={{ color: 'var(--color-neutral-500)' }}>
                                                {new Date(alert.last_order_date).toLocaleDateString()}
                                            </td>
                                            <td className="table-cell text-center">
                                                <span
                                                    className="inline-flex items-center justify-center w-12 h-7 rounded-full text-xs font-bold"
                                                    style={isUrgent ? {
                                                        backgroundColor: 'var(--color-warning-100)',
                                                        color: 'var(--color-warning-800)',
                                                    } : {
                                                        backgroundColor: 'var(--color-neutral-100)',
                                                        color: 'var(--color-neutral-700)',
                                                    }}
                                                >
                                                    {alert.days_since_last_order}d
                                                </span>
                                            </td>
                                            <td className="table-cell text-center" style={{ color: 'var(--color-neutral-500)' }}>
                                                {alert.days_supply}d
                                            </td>
                                            <td className="table-cell">
                                                <span className={`badge ${isUrgent ? 'badge-warning' : 'badge-success'}`}>
                                                    {isUrgent ? 'Urgent' : 'Monitor'}
                                                </span>
                                            </td>
                                            <td className="table-cell text-right">
                                                <button
                                                    onClick={() => notify(alert)}
                                                    className="btn btn-outline btn-sm"
                                                >
                                                    <Bell className="w-3.5 h-3.5" />
                                                    Notify
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
