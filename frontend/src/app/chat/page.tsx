"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Send, Bot, User, AlertCircle } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; }

export default function ChatPage() {
    const { user } = useAuth();
    const router = useRouter();
    const bottomRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hello! I'm RxBot, your AI pharmacy assistant. How can I help you today? You can ask me about medications, dosages, refills, or place a medication order.",
        },
    ]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) router.push('/login');
    }, [user, router]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, sending]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || sending) return;
        if (navigator.vibrate) navigator.vibrate(30);

        setInput('');
        setError('');
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setSending(true);

        try {
            const res = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    patientId: user?.id || 'guest',
                }),
            });
            if (!res.ok) throw new Error('Server error');
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch {
            setError('Could not reach the AI assistant. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    if (!user) return null;

    return (
        <div
            className="flex flex-col"
            style={{ height: 'calc(100vh - 64px)', backgroundColor: 'var(--color-neutral-50)' }}
        >
            {/* Chat header */}
            <div
                className="flex items-center gap-3 px-4 py-3 border-b"
                style={{
                    backgroundColor: '#ffffff',
                    borderColor: 'var(--color-neutral-200)',
                    flexShrink: 0,
                }}
            >
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-primary-100)' }}
                >
                    <Bot className="w-5 h-5" style={{ color: 'var(--color-primary-600)' }} />
                </div>
                <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-neutral-900)' }}>RxBot</p>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-success-500)' }} />
                        <span className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>Online · AI Assistant</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
                style={{ backgroundColor: 'var(--color-neutral-50)' }}
                aria-live="polite"
                aria-label="Chat messages"
            >
                {messages.map((msg, i) => (
                    <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div
                                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: 'var(--color-primary-100)' }}
                            >
                                <Bot className="w-4 h-4" style={{ color: 'var(--color-primary-600)' }} />
                            </div>
                        )}

                        <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                        </div>

                        {msg.role === 'user' && (
                            <div
                                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: 'var(--color-neutral-200)' }}
                            >
                                <User className="w-4 h-4" style={{ color: 'var(--color-neutral-600)' }} />
                            </div>
                        )}
                    </div>
                ))}

                {/* Typing indicator */}
                {sending && (
                    <div className="flex items-end gap-2 justify-start">
                        <div
                            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--color-primary-100)' }}
                        >
                            <Bot className="w-4 h-4" style={{ color: 'var(--color-primary-600)' }} />
                        </div>
                        <div className="chat-bubble-ai flex items-center gap-1 py-3">
                            {[0, 1, 2].map(i => (
                                <span
                                    key={i}
                                    className="block w-2 h-2 rounded-full"
                                    style={{
                                        backgroundColor: 'var(--color-neutral-400)',
                                        animation: `pulseDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="flex justify-center">
                        <div className="alert alert-error max-w-md" role="alert">
                            <AlertCircle className="alert-icon w-4 h-4" style={{ color: 'var(--color-error-600)' }} />
                            <p className="alert-body text-xs" style={{ color: 'var(--color-error-700)' }}>{error}</p>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div
                className="border-t p-4"
                style={{
                    backgroundColor: '#ffffff',
                    borderColor: 'var(--color-neutral-200)',
                    flexShrink: 0,
                }}
            >
                <div className="max-w-4xl mx-auto flex items-end gap-3">
                    <div className="flex-1">
                        <textarea
                            rows={1}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Ask about medications, dosage, or refills…"
                            className="input resize-none"
                            style={{ maxHeight: '8rem', lineHeight: '1.5' }}
                            aria-label="Message input"
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || sending}
                        className="btn btn-primary p-3"
                        style={{ flexShrink: 0, minHeight: '44px' }}
                        aria-label="Send message"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-center text-xs mt-2" style={{ color: 'var(--color-neutral-400)' }}>
                    RxBot can make mistakes. Always consult a qualified pharmacist for medical advice.
                </p>
            </div>
        </div>
    );
}
