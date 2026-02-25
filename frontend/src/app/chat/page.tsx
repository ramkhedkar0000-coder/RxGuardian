"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    Send, Bot, User, AlertCircle, Pill,
    Clock, ChevronRight,
    History, PhoneCall,
    ShieldCheck, Stethoscope, Activity
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { Header } from '@/components/Header';

interface Message { role: 'user' | 'assistant'; content: string; }

const QUICK_CHIPS = [
    { label: "Check Paracetamol stock", query: "Do you have Paracetamol in stock?" },
    { label: "Refill Reminder", query: "Set a refill reminder for my last order" },
    { label: "Pharmacy Hours", query: "What are your operating hours?" },
    { label: "Aspirin side effects", query: "Can you tell me about Aspirin side effects?" }
];

const NAV_ITEMS = [
    { icon: Pill, label: "Inventory", sub: "Browse medications", accent: "#5eead4" },
    { icon: Clock, label: "Refill Reminders", sub: "Upcoming refills", accent: "#a5b4fc" },
    { icon: History, label: "Order History", sub: "Past purchases", accent: "#94a3b8" },
    { icon: Activity, label: "Health Summary", sub: "Your profile", accent: "#f9a8d4" },
];

export default function ChatPage() {
    const { user } = useAuth();
    const router = useRouter();
    const bottomRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Welcome to RxGuardian's Intelligent Assistant. I can help you manage your medications, check our current pharmaceutical inventory, or set up refill reminders. How can I assist you today?",
        },
    ]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [activeNav, setActiveNav] = useState<number | null>(null);

    useEffect(() => {
        if (!user) router.push('/login');
    }, [user, router]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, sending]);

    const handleSend = async (customText?: string) => {
        const text = (customText || input).trim();
        if (!text || sending) return;
        setInput('');
        setError('');
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setSending(true);
        try {
            const res = await fetch(`${getApiUrl()}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, patientId: user?.id || 'guest' }),
            });
            if (!res.ok) throw new Error('Server error');
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch {
            setError('The AI service is currently experiencing high load. Please try again or contact our support team.');
        } finally {
            setSending(false);
        }
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    if (!user) return null;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

                .rx-sidebar {
                    background: #0f172a;
                    font-family: 'DM Sans', sans-serif;
                    border-right: 1px solid rgba(255,255,255,0.06);
                }

                .rx-brand-icon {
                    background: linear-gradient(135deg, #0d9488 0%, #5eead4 100%);
                    box-shadow: 0 0 18px rgba(94,234,212,0.22);
                }

                .rx-brand-name {
                    font-family: 'DM Serif Display', serif;
                    font-size: 16px;
                    line-height: 1.1;
                    background: linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .rx-hr {
                    height: 1px;
                    background: linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.12) 50%, transparent 100%);
                    border: none;
                    margin: 0;
                }

                .rx-label {
                    font-size: 9px;
                    font-weight: 600;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: rgba(148,163,184,0.4);
                    padding: 0 6px;
                    margin-bottom: 8px;
                    display: block;
                }

                .rx-nav-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 11px;
                    padding: 9px 10px;
                    border-radius: 9px;
                    border: 1px solid transparent;
                    background: transparent;
                    cursor: pointer;
                    transition: background 0.18s ease, border-color 0.18s ease;
                    text-align: left;
                }

                .rx-nav-btn:hover {
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(255,255,255,0.07);
                }

                .rx-nav-btn.active {
                    background: rgba(255,255,255,0.06);
                    border-color: rgba(255,255,255,0.09);
                }

                .rx-nav-icon {
                    width: 30px;
                    height: 30px;
                    border-radius: 7px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: transform 0.18s ease;
                }

                .rx-nav-btn:hover .rx-nav-icon { transform: scale(1.08); }

                .rx-nav-label {
                    font-size: 12.5px;
                    font-weight: 500;
                    color: #cbd5e1;
                    line-height: 1.2;
                    transition: color 0.18s;
                }

                .rx-nav-btn:hover .rx-nav-label,
                .rx-nav-btn.active .rx-nav-label { color: #f1f5f9; }

                .rx-nav-sub {
                    font-size: 9.5px;
                    color: rgba(148,163,184,0.5);
                    margin-top: 1px;
                }

                .rx-chevron {
                    margin-left: auto;
                    color: rgba(148,163,184,0.35);
                    opacity: 0;
                    transform: translateX(-3px);
                    transition: opacity 0.18s, transform 0.18s;
                    flex-shrink: 0;
                }

                .rx-nav-btn:hover .rx-chevron {
                    opacity: 1;
                    transform: translateX(0);
                }

                .rx-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 4px 9px;
                    background: rgba(20,83,45,0.28);
                    border: 1px solid rgba(74,222,128,0.18);
                    border-radius: 99px;
                }

                .rx-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: #4ade80;
                    animation: rx-pulse 2.2s ease-in-out infinite;
                    flex-shrink: 0;
                }

                @keyframes rx-pulse {
                    0%, 100% { box-shadow: 0 0 3px rgba(74,222,128,0.5); opacity: 1; }
                    50% { box-shadow: 0 0 9px rgba(74,222,128,0.9); opacity: 0.85; }
                }

                .rx-info-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 11px;
                    background: rgba(255,255,255,0.025);
                    border: 1px solid rgba(255,255,255,0.055);
                    border-radius: 9px;
                    transition: background 0.18s, border-color 0.18s;
                }

                .rx-info-card:hover {
                    background: rgba(255,255,255,0.045);
                    border-color: rgba(255,255,255,0.09);
                }

                .rx-info-icon {
                    width: 26px;
                    height: 26px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .rx-cta {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    padding: 9px 14px;
                    background: rgba(13,148,136,0.12);
                    border: 1px solid rgba(94,234,212,0.18);
                    border-radius: 9px;
                    color: #5eead4;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 10.5px;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: background 0.18s, border-color 0.18s, box-shadow 0.18s;
                }

                .rx-cta:hover {
                    background: rgba(13,148,136,0.22);
                    border-color: rgba(94,234,212,0.35);
                    box-shadow: 0 0 14px rgba(94,234,212,0.1);
                }

                .rx-cta:active { transform: scale(0.98); }

                .rx-user-row {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    padding: 9px 10px;
                    background: rgba(255,255,255,0.025);
                    border: 1px solid rgba(255,255,255,0.055);
                    border-radius: 9px;
                    cursor: pointer;
                    transition: background 0.18s;
                }

                .rx-user-row:hover { background: rgba(255,255,255,0.05); }

                .rx-avatar {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #0d9488, #6366f1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    font-family: 'DM Serif Display', serif;
                    font-size: 12px;
                    color: white;
                }

                .rx-scroll::-webkit-scrollbar { width: 3px; }
                .rx-scroll::-webkit-scrollbar-track { background: transparent; }
                .rx-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 2px; }
                .rx-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.13); }
            `}</style>

            <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
                <Header />

                <main className="flex-1 flex overflow-hidden min-h-0">

                    {/* ══ ELEGANT SIDEBAR ══ */}
                    <aside className="rx-sidebar hidden lg:flex w-[260px] flex-col shrink-0">

                        {/* Brand */}
                        <div style={{ padding: '18px 14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <div className="rx-brand-icon" style={{ width: 33, height: 33, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Bot style={{ width: 16, height: 16, color: 'white' }} />
                                </div>
                                <div>
                                    <div className="rx-brand-name">RxBot</div>
                                    <div style={{ fontSize: 9.5, color: 'rgba(148,163,184,0.55)', letterSpacing: '0.05em', marginTop: 2 }}>Pharmacy Assistant</div>
                                </div>
                            </div>
                            <div className="rx-status">
                                <div className="rx-dot" />
                                <span style={{ fontSize: 9, fontWeight: 600, color: '#4ade80', letterSpacing: '0.07em' }}>ONLINE · READY</span>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="rx-scroll flex-1 overflow-y-auto min-h-0" style={{ padding: '18px 10px', display: 'flex', flexDirection: 'column', gap: 24 }}>

                            {/* Nav */}
                            <div>
                                <span className="rx-label">Navigation</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {NAV_ITEMS.map((item, i) => (
                                        <button
                                            key={i}
                                            className={`rx-nav-btn ${activeNav === i ? 'active' : ''}`}
                                            onClick={() => setActiveNav(activeNav === i ? null : i)}
                                        >
                                            <div
                                                className="rx-nav-icon"
                                                style={{ background: `${item.accent}15`, border: `1px solid ${item.accent}20` }}
                                            >
                                                <item.icon style={{ width: 13, height: 13, color: item.accent }} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div className="rx-nav-label">{item.label}</div>
                                                <div className="rx-nav-sub">{item.sub}</div>
                                            </div>
                                            <ChevronRight className="rx-chevron" style={{ width: 12, height: 12 }} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <hr className="rx-hr" />

                            {/* Assurance Cards */}
                            <div>
                                <span className="rx-label">Assurances</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <div className="rx-info-card">
                                        <div className="rx-info-icon" style={{ background: 'rgba(13,148,136,0.14)', border: '1px solid rgba(94,234,212,0.14)' }}>
                                            <ShieldCheck style={{ width: 12, height: 12, color: '#5eead4' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>HIPAA Compliant</div>
                                            <div style={{ fontSize: 9.5, color: 'rgba(148,163,184,0.5)', marginTop: 2, lineHeight: 1.5 }}>End-to-end encrypted sessions</div>
                                        </div>
                                    </div>
                                    <div className="rx-info-card">
                                        <div className="rx-info-icon" style={{ background: 'rgba(99,102,241,0.14)', border: '1px solid rgba(165,180,252,0.14)' }}>
                                            <Stethoscope style={{ width: 12, height: 12, color: '#a5b4fc' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>Expert Pharmacists</div>
                                            <div style={{ fontSize: 9.5, color: 'rgba(148,163,184,0.5)', marginTop: 2, lineHeight: 1.5 }}>Mon – Sat, 9 AM to 7 PM</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="rx-hr" />

                            {/* Account */}
                            <div>
                                <span className="rx-label">Account</span>
                                <div className="rx-user-row">
                                    <div className="rx-avatar">
                                        {user?.email?.[0]?.toUpperCase() ?? 'U'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 11.5, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {user?.email ?? 'Guest User'}
                                        </div>
                                        <div style={{ fontSize: 9.5, color: 'rgba(148,163,184,0.45)', marginTop: 1 }}>Patient · Active</div>
                                    </div>
                                    <ChevronRight style={{ width: 11, height: 11, color: 'rgba(148,163,184,0.25)', flexShrink: 0 }} />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <button className="rx-cta">
                                <PhoneCall style={{ width: 12, height: 12 }} />
                                Contact Pharmacist
                            </button>
                        </div>
                    </aside>

                    {/* ── Main Chat Window ── */}
                    <section className="flex-1 flex flex-col bg-white overflow-hidden min-w-0">
                        {/* Mobile Header */}
                        <div className="lg:hidden px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white shadow-sm shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                                    <Bot className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900 text-sm leading-tight">RxBot</h2>
                                    <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                                <History className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto bg-slate-50/40 min-h-0">
                            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${msg.role === 'assistant' ? 'bg-white border border-slate-200' : 'bg-teal-600'}`}>
                                            {msg.role === 'assistant'
                                                ? <Bot className="w-4 h-4 text-teal-600" />
                                                : <User className="w-4 h-4 text-white" />}
                                        </div>
                                        <div className="min-w-0 max-w-[80%] sm:max-w-[75%]">
                                            <div className={`px-4 py-3 shadow-sm ${msg.role === 'user'
                                                ? 'bg-teal-600 text-white rounded-2xl rounded-tr-sm'
                                                : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'}`}>
                                                <p className="text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                                            </div>
                                            <div className={`mt-1 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                                <span className="text-[10px] text-slate-400 font-medium">Just now</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {sending && (
                                    <div className="flex items-start gap-3">
                                        <div className="shrink-0 w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                            <Bot className="w-4 h-4 text-teal-600 animate-pulse" />
                                        </div>
                                        <div className="bg-white border border-slate-200 px-4 py-3.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="flex justify-center">
                                        <div className="px-4 py-2 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-100 flex items-center gap-2 shadow-sm max-w-[90%]">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    </div>
                                )}

                                <div ref={bottomRef} />
                            </div>
                        </div>

                        {/* Input */}
                        <div className="px-4 sm:px-6 py-4 bg-white border-t border-slate-100 shrink-0">
                            <div className="max-w-3xl mx-auto space-y-3">
                                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
                                    {QUICK_CHIPS.map((chip, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSend(chip.query)}
                                            disabled={sending}
                                            className="whitespace-nowrap shrink-0 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-full hover:border-teal-400 hover:text-teal-700 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {chip.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center bg-white border-2 border-slate-100 focus-within:border-teal-400 rounded-2xl shadow-sm transition-colors overflow-hidden px-1.5 py-1.5 gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={handleKey}
                                        placeholder="Type your medical query here..."
                                        className="flex-1 min-w-0 px-3 py-2 text-[14px] sm:text-[15px] outline-none bg-transparent placeholder:text-slate-400 text-slate-800"
                                    />
                                    <button
                                        onClick={() => handleSend()}
                                        disabled={!input.trim() || sending}
                                        className={`shrink-0 p-2.5 rounded-xl transition-all ${input.trim() && !sending
                                            ? 'bg-teal-600 text-white shadow-sm hover:bg-teal-700 active:scale-95'
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-center text-[10px] text-slate-400 leading-relaxed">
                                    Powered by Gemini AI · For emergencies, dial emergency services immediately.
                                </p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}