"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Pill, Bell, LogOut, Package, LayoutDashboard, Bot, ShoppingCart } from 'lucide-react';
import { CartDrawer } from './CartDrawer';
import { useState } from 'react';

export function Header() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const pathname = usePathname();
    const [isCartOpen, setIsCartOpen] = useState(false);

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    const patientLinks = [
        { href: '/', label: 'Medications', icon: <Pill className="w-4 h-4" /> },
        { href: '/orders', label: 'My Orders', icon: <Package className="w-4 h-4" /> },
        { href: '/chat', label: 'AI Assistant', icon: <Bot className="w-4 h-4" /> },
    ];

    const adminLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { href: '/admin/orders', label: 'Orders', icon: <Package className="w-4 h-4" /> },
        { href: '/admin/inventory', label: 'Inventory', icon: <Pill className="w-4 h-4" /> },
        { href: '/admin/logs', label: 'AI Logs', icon: <Bot className="w-4 h-4" /> },
    ];

    const links = user?.role === 'admin' ? adminLinks : patientLinks;
    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U';

    return (
        <header className="site-header">
            <div className="page-wrapper">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group no-underline">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'var(--color-primary-500)' }}
                        >
                            <Pill className="w-4 h-4 text-white" />
                        </div>
                        <span
                            className="text-lg font-bold"
                            style={{ color: 'var(--color-neutral-900)' }}
                        >
                            RXGuardians
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    {user && (
                        <nav className="hidden md:flex items-center gap-1">
                            {links.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`nav-link flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors duration-150 ${isActive(link.href) ? 'nav-link-active bg-blue-50' : 'hover:bg-neutral-100'
                                        }`}
                                    style={{
                                        color: isActive(link.href)
                                            ? 'var(--color-primary-600)'
                                            : 'var(--color-neutral-700)',
                                        fontWeight: isActive(link.href) ? 600 : 500,
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    {link.icon}
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    )}

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                {/* Role badge */}
                                <span
                                    className={`badge hidden sm:inline-flex ${user.role === 'admin' ? 'badge-warning' : 'badge-info'
                                        }`}
                                >
                                    {user.role === 'admin' ? 'Admin' : 'Patient'}
                                </span>

                                {/* Avatar */}
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                                    style={{
                                        backgroundColor: 'var(--color-primary-100)',
                                        color: 'var(--color-primary-700)',
                                    }}
                                    title={user.name || 'User'}
                                >
                                    {initials}
                                </div>

                                {/* Logout */}
                                <button
                                    onClick={logout}
                                    className="p-2 rounded-lg transition-colors duration-150"
                                    style={{ color: 'var(--color-neutral-500)' }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-neutral-100)';
                                        (e.currentTarget as HTMLElement).style.color = 'var(--color-neutral-700)';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                                        (e.currentTarget as HTMLElement).style.color = 'var(--color-neutral-500)';
                                    }}
                                    aria-label="Log out"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="btn btn-primary btn-sm hidden sm:inline-flex"
                            >
                                Sign in
                            </Link>
                        )}

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors duration-150"
                            aria-label="Open Cart"
                        >
                            <ShoppingCart className="w-5 h-5 text-primary-600" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Slide-out Cart Drawer */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </header>
    );
}
