"use client";

import { useEffect, useState } from "react";

interface ToastProps {
    message: string;
    duration?: number;
    onClose: () => void;
}

export function Toast({ message, duration = 3000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade-out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="glass px-6 py-3 rounded-2xl border border-white/20 shadow-2xl flex items-center space-x-3 bg-slate-900/80">
                <span className="text-primary text-lg">🛡️</span>
                <span className="text-sm font-bold text-white tracking-tight">{message}</span>
            </div>
        </div>
    );
}

// Simple Toast Manager Hook/Context would be better for real apps, 
// but for this MVP, we can trigger it in the CartContext or locally.
