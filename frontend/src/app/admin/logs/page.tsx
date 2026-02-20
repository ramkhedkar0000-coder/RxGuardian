"use client";

import { useEffect, useState } from 'react';
import { Bot, ShoppingCart, MessageSquare, Package } from 'lucide-react';

interface LogEntry {
    timestamp: string;
    query: string;
    response: string;
    toolCall?: string;
}

type Filter = 'all' | 'orders' | 'queries';

export default function LogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>('all');

    useEffect(() => {
        fetch('http://localhost:3001/api/logs')
            .then(r => r.json())
            .then(d => { setLogs([...d].reverse()); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filtered = logs.filter(l => {
        if (filter === 'orders') return !!l.toolCall;
        if (filter === 'queries') return !l.toolCall;
        return true;
    });

    const orderCount = logs.filter(l => l.toolCall).length;
    const queryCount = logs.filter(l => !l.toolCall).length;

    const stats = [
        {
            label: 'Total Interactions',
            value: logs.length,
            icon: <Bot className="w-6 h-6" style={{ color: 'var(--color-primary-600)' }} />,
            accent: 'stat-accent-blue',
        },
        {
            label: 'AI-Placed Orders',
            value: orderCount,
            icon: <ShoppingCart className="w-6 h-6" style={{ color: 'var(--color-success-600)' }} />,
            accent: 'stat-accent-green',
        },
        {
            label: 'General Queries',
            value: queryCount,
            icon: <MessageSquare className="w-6 h-6" style={{ color: 'var(--color-warning-600)' }} />,
            accent: 'stat-accent-amber',
        },
    ];

    const filterTabs: { key: Filter; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'orders', label: 'Orders' },
        { key: 'queries', label: 'Queries' },
    ];

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-neutral-50)' }}>
            <div className="page-wrapper py-8">

                {/* Page header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="page-title">AI Interaction Logs</h1>
                        <p className="page-subtitle">Observability for all chatbot interactions</p>
                    </div>

                    {/* Filter tabs */}
                    <div
                        className="flex gap-1 p-1 rounded-lg self-start sm:self-auto"
                        style={{
                            backgroundColor: 'var(--color-neutral-100)',
                            border: '1px solid var(--color-neutral-200)',
                        }}
                        role="tablist"
                        aria-label="Filter logs"
                    >
                        {filterTabs.map(tab => (
                            <button
                                key={tab.key}
                                role="tab"
                                aria-selected={filter === tab.key}
                                onClick={() => setFilter(tab.key)}
                                className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 capitalize"
                                style={filter === tab.key ? {
                                    backgroundColor: '#ffffff',
                                    color: 'var(--color-neutral-900)',
                                    boxShadow: 'var(--shadow-sm)',
                                } : {
                                    color: 'var(--color-neutral-500)',
                                    background: 'none',
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {stats.map((s, i) => (
                        <div key={i} className={`stat-card ${s.accent}`}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="stat-card-label">{s.label}</p>
                                {s.icon}
                            </div>
                            <p className="stat-card-value">
                                {loading ? '—' : s.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Logs list */}
                <div className="table-container">
                    <div
                        className="px-4 py-3 border-b"
                        style={{ borderColor: 'var(--color-neutral-200)', backgroundColor: 'var(--color-neutral-50)' }}
                    >
                        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-neutral-700)' }}>
                            {loading ? 'Loading…' : `${filtered.length} ${filter === 'all' ? 'interactions' : filter}`}
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-6 space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="space-y-2 animate-pulse">
                                    <div className="skeleton h-3 w-1/4" />
                                    <div className="skeleton h-4 w-full" />
                                    <div className="skeleton h-3 w-5/6" />
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <Bot className="w-8 h-8" style={{ color: 'var(--color-neutral-400)' }} />
                            </div>
                            <h3 className="empty-state-title">No logs yet</h3>
                            <p className="empty-state-desc">
                                Chat interactions will appear here once users start using the assistant.
                            </p>
                        </div>
                    ) : (
                        filtered.map((log, idx) => (
                            <div
                                key={idx}
                                className="p-5 transition-colors duration-150"
                                style={{
                                    borderBottom: idx < filtered.length - 1
                                        ? '1px solid var(--color-neutral-200)'
                                        : 'none',
                                }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-neutral-50)'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff'}
                            >
                                {/* Row: timestamp + type badge */}
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-xs font-mono" style={{ color: 'var(--color-neutral-400)' }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </span>
                                    {log.toolCall ? (
                                        <span className="badge badge-success">
                                            <ShoppingCart className="w-3 h-3" /> Order Placed
                                        </span>
                                    ) : (
                                        <span className="badge badge-neutral">
                                            <MessageSquare className="w-3 h-3" /> Query
                                        </span>
                                    )}
                                </div>

                                {/* Query / Response */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                                            style={{ color: 'var(--color-neutral-400)' }}>
                                            User Query
                                        </p>
                                        <p
                                            className="text-sm p-3 rounded-lg"
                                            style={{
                                                backgroundColor: 'var(--color-neutral-50)',
                                                border: '1px solid var(--color-neutral-200)',
                                                color: 'var(--color-neutral-700)',
                                            }}
                                        >
                                            {log.query}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                                            style={{ color: 'var(--color-neutral-400)' }}>
                                            AI Response
                                        </p>
                                        <p
                                            className="text-sm p-3 rounded-lg line-clamp-3"
                                            style={{
                                                backgroundColor: 'var(--color-primary-50)',
                                                border: '1px solid var(--color-primary-200)',
                                                color: 'var(--color-primary-900)',
                                            }}
                                        >
                                            {log.response}
                                        </p>
                                    </div>
                                </div>

                                {/* Tool call */}
                                {log.toolCall && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                                            style={{ color: 'var(--color-neutral-400)' }}>
                                            Tool Called
                                        </p>
                                        <code
                                            className="inline-block text-xs px-2.5 py-1 rounded-md font-mono"
                                            style={{
                                                backgroundColor: 'var(--color-success-100)',
                                                color: 'var(--color-success-800)',
                                                border: '1px solid var(--color-success-500)',
                                            }}
                                        >
                                            {log.toolCall}
                                        </code>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
