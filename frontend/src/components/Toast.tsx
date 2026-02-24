"use client";

import { useToast } from '@/context/ToastContext';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function Toast({ toast, onClose }: { toast: any, onClose: () => void }) {
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Handle custom exit animation
        const timer = setTimeout(() => {
            setIsLeaving(true);
        }, (toast.duration || 3000) - 300);

        return () => clearTimeout(timer);
    }, [toast.duration]);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(onClose, 300);
    };

    return (
        <div
            className={`pointer-events-auto flex items-start p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-border shadow-xl rounded-2xl transition-all duration-300 ease-out ${isLeaving ? 'opacity-0 translate-y-2 scale-95' : 'animate-slide-in-right'}`}
        >
            <div className="flex-shrink-0 mr-3 mt-0.5">
                {toast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                {toast.type === "error" && <AlertTriangle className="w-5 h-5 text-red-500" />}
                {toast.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {toast.type === "info" && <Info className="w-5 h-5 text-blue-500" />}
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground">{toast.message}</h4>
                {toast.description && (
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {toast.description}
                    </p>
                )}
            </div>
            <button
                onClick={handleClose}
                className="flex-shrink-0 ml-4 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
