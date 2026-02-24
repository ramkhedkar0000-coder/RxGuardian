"use client";

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import ChatButton from '@/components/ChatButton';
import { Pill, Clock, Shield, HeartPulse, Loader } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  pzn?: string;
  price: number;
  packageSize?: string;
  description?: string;
  stock: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/products')
      .then(r => r.json())
      .then(d => { setProducts(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const features = [
    { icon: <Clock className="w-6 h-6" style={{ color: 'var(--color-primary-500)' }} />, label: 'Fast Delivery', desc: 'Same-day dispatch on orders before 2 PM' },
    { icon: <Shield className="w-6 h-6" style={{ color: 'var(--color-primary-500)' }} />, label: 'HIPAA Compliant', desc: 'Your health data is safe and private' },
    { icon: <HeartPulse className="w-6 h-6" style={{ color: 'var(--color-primary-500)' }} />, label: 'AI Assistance', desc: 'Ask RxBot about any medication' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-neutral-50)' }}>

      {/* ── Hero ── */}
      <section
        className="border-b"
        style={{
          backgroundColor: '#ffffff',
          borderColor: 'var(--color-neutral-200)',
        }}
      >
        <div className="page-wrapper py-12 md:py-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Pill className="w-5 h-5" style={{ color: 'var(--color-primary-500)' }} />
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-primary-600)' }}
              >
                AI-Powered Pharmacy Assistant
              </span>
            </div>

            <h1
              className="page-title mb-4"
              style={{ fontSize: '2.25rem', lineHeight: '1.2' }}
            >
              Your medications, <br />
              <span style={{ color: 'var(--color-primary-600)' }}>delivered with care</span>
            </h1>

            <p
              className="text-lg mb-8"
              style={{ color: 'var(--color-neutral-600)', maxWidth: '36rem' }}
            >
              Order prescriptions and over‑the‑counter medicines. Ask our
              AI assistant for guidance on dosage, interactions, and refills.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="/chat"
                className="btn btn-primary btn-lg"
              >
                Chat with RxBot
              </a>
              <a
                href="#catalog"
                className="btn btn-secondary btn-lg"
                onClick={e => { e.preventDefault(); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                Browse Medications
              </a>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            {features.map(f => (
              <div
                key={f.label}
                className="flex items-start gap-3 p-4 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-primary-50)',
                  border: '1px solid var(--color-primary-100)',
                }}
              >
                <div className="flex-shrink-0 mt-0.5">{f.icon}</div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--color-neutral-900)' }}>{f.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-neutral-600)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Catalog ── */}
      <section id="catalog" className="page-wrapper py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2
              className="text-2xl font-bold"
              style={{ color: 'var(--color-neutral-900)' }}
            >
              Medication Catalog
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-neutral-500)' }}>
              {loading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'item' : 'items'} available`}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4" style={{ color: 'var(--color-neutral-400)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search medications…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse" style={{ padding: '1.25rem' }}>
                <div className="skeleton h-4 w-3/4 mb-3" />
                <div className="skeleton h-3 w-1/2 mb-6" />
                <div className="skeleton h-8 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="w-8 h-8" style={{ color: 'var(--color-neutral-400)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="empty-state-title">No results found</h3>
            <p className="empty-state-desc">
              We couldn&apos;t find any medications matching &ldquo;{search}&rdquo;. Try a different name or ingredient.
            </p>
            <button
              className="btn btn-secondary btn-md"
              onClick={() => setSearch('')}
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Fixed AI chat button */}
      <ChatButton />
    </div>
  );
}
