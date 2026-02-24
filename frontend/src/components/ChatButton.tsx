"use client";

import Link from 'next/link';
import { Bot } from 'lucide-react';

export default function ChatButton() {
    return (
        <Link
            href="/chat"
            aria-label="Open AI Assistant"
            className="fixed bottom-6 right-6 z-30 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
            style={{
                backgroundColor: 'var(--color-primary-500)',
                color: '#ffffff',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-primary-600)';
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-primary-500)';
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
        >
            <Bot className="w-6 h-6" />
        </Link>
    );
}
