"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [mode, setMode] = useState<"LOGIN" | "SIGNUP">("LOGIN");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Panel */}
            <div className="relative w-full max-w-md glass p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-foreground/60 hover:text-foreground"
                >
                    ✕
                </button>

                <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 mb-6">
                        <span className="text-3xl">🛡️</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                        {mode === "LOGIN" ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        {mode === "LOGIN"
                            ? "Access your secure medical dashboard."
                            : "Join the next-gen AI pharmacy shield."}
                    </p>
                </div>

                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    {mode === "SIGNUP" && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">Full Name</label>
                            <input
                                type="text"
                                placeholder="Dr. John Doe"
                                className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">Medical Email</label>
                        <input
                            type="email"
                            placeholder="name@rxguardian.ai"
                            className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">Passcode</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-muted border border-border rounded-2xl px-6 py-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                        />
                    </div>

                    <button className="w-full py-5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 active:scale-[0.98] mt-4">
                        {mode === "LOGIN" ? "Authorize Access" : "Initialize Encryption"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setMode(mode === "LOGIN" ? "SIGNUP" : "LOGIN")}
                        className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
                    >
                        {mode === "LOGIN"
                            ? "Need a secure account? Register"
                            : "Already have access? Login"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
