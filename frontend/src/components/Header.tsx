"use client";

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { CartDrawer } from './CartDrawer';
import { useState } from 'react';
import { AuthModal } from './AuthModal';

export function Header() {
    const { totalItems, setIsCartOpen } = useCart();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Pharmacy', href: '/' },
        { name: 'History', href: '/orders' },
        { name: 'Analysis', href: '/dashboard' },
    ];

    return (
        <header className="glass-header px-8 py-4 fixed top-0 w-full">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-2 group">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                        <span className="text-white text-xl">🛡️</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        RxGuardian
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center space-x-4 md:space-x-6">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <span className="text-xl">🛒</span>
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </button>

                    <div
                        onClick={() => setIsAuthOpen(true)}
                        className="w-10 h-10 rounded-full border border-border p-0.5 hover:border-primary/50 transition-colors cursor-pointer"
                    >
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-200 to-slate-400 overflow-hidden flex items-center justify-center">
                            <span className="text-xs text-white">JD</span>
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className={`md:hidden fixed inset-x-0 top-[73px] bg-background/80 backdrop-blur-2xl border-b border-border/50 transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                <nav className="flex flex-col p-6 space-y-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-lg font-bold text-foreground hover:text-primary transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>
            </div>

            <CartDrawer />
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </header>
    );
}
