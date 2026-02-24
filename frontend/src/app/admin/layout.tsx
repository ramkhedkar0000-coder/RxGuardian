"use client";

import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'admin')) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-neutral-50)' }}
            >
                <div className="text-center">
                    <Loader
                        className="w-8 h-8 mx-auto mb-3"
                        style={{ color: 'var(--color-primary-500)', animation: 'spin 1s linear infinite' }}
                    />
                    <p className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>
                        Verifying access…
                    </p>
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-neutral-50)' }}>
            <Header />
            <main className="flex-grow pt-0">
                {children}
            </main>
        </div>
    );
}
