"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Pill, LogOut, Package, LayoutDashboard, Bot, ShoppingCart } from 'lucide-react';
import { CartDrawer } from './CartDrawer';
import { useState, useEffect } from 'react';

export function Header() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const pathname = usePathname();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const isActive = (href: string) =>
        pathname === href || (href !== '/' && pathname.startsWith(href));

    const patientLinks = [
        { href: '/browse', label: 'Medicines', icon: Pill },
        { href: '/orders', label: 'My Orders', icon: Package },
        { href: '/chat', label: 'AI Assistant', icon: Bot },
    ];
    const adminLinks = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/orders', label: 'Orders', icon: Package },
        { href: '/admin/inventory', label: 'Inventory', icon: Pill },
        { href: '/admin/logs', label: 'AI Logs', icon: Bot },
    ];

    const links = user?.role === 'admin' ? adminLinks : patientLinks;

    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U';

    // Cart is shown only for patients, not admins
    const showCart = user?.role !== 'admin';

    return (
        <>
            <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
                <div className="page-wrapper">
                    <div className="flex items-center justify-between h-16">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group no-underline flex-shrink-0">
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200"
                                style={{ background: 'linear-gradient(135deg, #0d9488, #4f46e5)' }}
                            >
                                <Pill className="text-white" style={{ width: '1rem', height: '1rem' }} />
                            </div>
                            <div className="leading-none">
                                <span
                                    className="font-black text-lg tracking-tight block"
                                    style={{ color: '#0f172a', letterSpacing: '-0.03em' }}
                                >
                                    Rx<span style={{ color: '#0d9488' }}>Guardian</span>
                                </span>
                                <span className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>
                                    India&apos;s Trusted Pharmacy
                                </span>
                            </div>
                        </Link>

                        {/* Nav */}
                        {user && (
                            <nav className="hidden md:flex items-center gap-0.5">
                                {links.map(({ href, label, icon: Icon }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`nav-link ${isActive(href) ? 'nav-link-active' : ''}`}
                                    >
                                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                        {label}
                                    </Link>
                                ))}
                            </nav>
                        )}

                        {/* Right side */}
                        <div className="flex items-center gap-1.5">
                            {user ? (
                                <>
                                    {/* Role badge */}
                                    <span className={`badge hidden sm:inline-flex ${user.role === 'admin' ? 'badge-warning' : 'badge-teal'}`}>
                                        {user.role === 'admin' ? '⚙ Admin' : '✓ Patient'}
                                    </span>

                                    {/* Avatar + name */}
                                    <div className="flex items-center gap-1.5 pl-1">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm flex-shrink-0"
                                            style={{ background: 'linear-gradient(135deg, #0d9488, #4f46e5)', color: '#fff' }}
                                            title={user.name || 'User'}
                                        >
                                            {initials}
                                        </div>
                                        <span className="text-sm font-medium hidden lg:block" style={{ color: '#334155' }}>
                                            {user.name?.split(' ')[0] ?? 'User'}
                                        </span>
                                    </div>

                                    {/* Logout */}
                                    <button
                                        onClick={logout}
                                        className="btn btn-ghost btn-sm hidden sm:flex"
                                        aria-label="Logout"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <Link href="/login" className="btn btn-primary btn-sm">
                                    Sign In
                                </Link>
                            )}

                            {/* Cart — patients only */}
                            {showCart && (
                                <button
                                    onClick={() => setIsCartOpen(true)}
                                    className="relative p-2.5 rounded-xl transition-all duration-150 hover:bg-teal-50 group"
                                    style={{ color: '#0d9488' }}
                                    aria-label={`Cart${totalItems > 0 ? `, ${totalItems} item${totalItems !== 1 ? 's' : ''}` : ''}`}
                                >
                                    <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-150" />
                                    {totalItems > 0 && (
                                        <span
                                            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black text-white ring-2 ring-white"
                                            style={{
                                                backgroundColor: '#ef4444',
                                                animation: 'badgePop 0.3s var(--ease-out) both',
                                            }}
                                        >
                                            {totalItems > 9 ? '9+' : totalItems}
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}