"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Pill } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();

    const [role, setRole] = useState<'patient' | 'admin'>('patient');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    /** Fill demo credentials and set role */
    const fillDemo = (r: 'patient' | 'admin') => {
        if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
        setRole(r);
        setEmail(r === 'patient' ? 'patient@rxguardians.com' : 'admin@rxguardians.com');
    };

    /**
     * AuthContext.login(email, role) — does NOT take a password.
     * The mock auth simply validates the email string against known addresses.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) { setError('Please enter your email address.'); return; }
        setError('');
        setLoading(true);
        try {
            const ok = await login(email.trim(), role);
            if (ok === false) setError('Invalid email for the selected role. Please try the demo buttons.');
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ backgroundColor: 'var(--color-neutral-50)' }}
        >
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                        style={{ backgroundColor: 'var(--color-primary-500)' }}
                    >
                        <Pill className="w-6 h-6 text-white" />
                    </div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: 'var(--color-neutral-900)' }}
                    >
                        Sign in to RXGuardians
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-neutral-500)' }}>
                        AI-powered pharmacy assistant
                    </p>
                </div>

                {/* Card */}
                <div className="card" style={{ padding: '2rem' }}>

                    {/* Role toggle (segmented control) */}
                    <div
                        className="flex rounded-lg p-1 mb-6"
                        style={{
                            backgroundColor: 'var(--color-neutral-100)',
                            border: '1px solid var(--color-neutral-200)',
                        }}
                        role="radiogroup"
                        aria-label="Account type"
                    >
                        {(['patient', 'admin'] as const).map(r => (
                            <button
                                key={r}
                                type="button"
                                role="radio"
                                aria-checked={role === r}
                                onClick={() => setRole(r)}
                                className="flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200"
                                style={role === r ? {
                                    backgroundColor: '#ffffff',
                                    color: 'var(--color-neutral-900)',
                                    boxShadow: 'var(--shadow-sm)',
                                } : {
                                    color: 'var(--color-neutral-500)',
                                    background: 'none',
                                }}
                            >
                                {r === 'patient' ? '🏥 Patient' : '⚕️ Admin'}
                            </button>
                        ))}
                    </div>

                    {/* Error alert */}
                    {error && (
                        <div className="alert alert-error mb-5" role="alert">
                            <AlertCircle
                                className="alert-icon"
                                style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-error-600)', flexShrink: 0 }}
                            />
                            <div className="alert-content">
                                <p className="alert-body" style={{ color: 'var(--color-error-700)' }}>{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        <div>
                            <label htmlFor="login-email" className="label">
                                Email address{' '}
                                <span aria-hidden="true" style={{ color: 'var(--color-error-500)' }}>*</span>
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                autoComplete="email"
                                required
                                aria-required="true"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@rxguardians.com"
                                className="input"
                            />
                            <p className="input-hint">
                                Use the demo buttons below to auto-fill credentials.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary btn-lg w-full"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in…
                                </span>
                            ) : (
                                `Sign in as ${role === 'admin' ? 'Admin' : 'Patient'}`
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-neutral-200)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--color-neutral-400)' }}>Demo credentials</span>
                        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-neutral-200)' }} />
                    </div>

                    {/* Demo fill buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => fillDemo('patient')}
                            className="btn btn-secondary btn-sm"
                        >
                            Fill Patient
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemo('admin')}
                            className="btn btn-secondary btn-sm"
                        >
                            Fill Admin
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs mt-6" style={{ color: 'var(--color-neutral-400)' }}>
                    HIPAA-compliant demo · Your data is never stored
                </p>
            </div>
        </div>
    );
}
