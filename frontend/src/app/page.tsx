"use client";

import Link from 'next/link';
import { Pill, Shield, HeartPulse, ArrowRight, Sparkles, TrendingUp, Package, Bot, Bell } from 'lucide-react';
import { Header } from '@/components/Header';

const HERO_CARDS = [
  {
    icon: Bot,
    iconColor: 'text-teal-600',
    bg: 'bg-teal-50',
    title: '24/7 AI Support',
    sub: 'Instant answers to dosage questions',
    shift: 'md:-translate-x-4',
  },
  {
    icon: Pill,
    iconColor: 'text-indigo-600',
    bg: 'bg-indigo-50',
    title: 'Authentic Meds',
    sub: '100% verified and safe prescriptions',
    shift: 'md:translate-x-4',
  },
  {
    icon: Bell,
    iconColor: 'text-amber-600',
    bg: 'bg-amber-50',
    title: 'Automated Refill Alerts',
    sub: 'Never run out of essential medication',
    shift: 'md:-translate-x-2',
  },
];

const FEATURES = [
  {
    icon: Bot,
    iconColor: 'text-indigo-600',
    bg: 'bg-indigo-50',
    title: 'Smart AI Assistant',
    desc: 'Have a question about dosage or side effects? Our advanced AI immediately understands your context and history.',
  },
  {
    icon: Bell,
    iconColor: 'text-teal-600',
    bg: 'bg-teal-50',
    title: 'Predictive Refills',
    desc: 'Never run out of essential medication. We calculate your adherence and alert you precisely when it is time to restock.',
  },
  {
    icon: Shield,
    iconColor: 'text-blue-600',
    bg: 'bg-blue-50',
    title: 'Bank-Grade Security',
    desc: 'Your medical data and digital prescriptions are encrypted and securely vaulted. Access to your patient history is tightly restricted.',
  },
];

const TRUST_ITEMS = [
  { icon: Shield, label: 'HIPAA Compliant' },
  { icon: HeartPulse, label: 'Licensed Pharmacy' },
  { icon: Package, label: 'Express Delivery' },
  { icon: TrendingUp, label: 'Real-time Tracking' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-indigo-50/30 -z-10" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-80 h-80 bg-indigo-100/50 rounded-full blur-3xl -z-10" />

        <div className="page-wrapper py-24 lg:py-36 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy & CTA */}
          <div className="flex flex-col justify-center gap-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100/80 text-teal-800 text-base font-semibold shadow-sm border border-teal-200/50 w-fit mb-4">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <span>Next-Gen Pharmacy Experience</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
              Smarter Healthcare,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600">
                Delivered Faster.
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-6 max-w-xl leading-relaxed">
              RxGuardian combines artificial intelligence with secure medical fulfillment.<br />
              <span className="font-medium text-teal-700">Instant answers</span> to your medication questions and <span className="font-medium text-indigo-700">proactive refill management</span>.
            </p>

            <div className="flex flex-row items-center gap-4">
              <Link
                href="/login"
                className="px-8 py-4 bg-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-teal-600/20 hover:bg-teal-700 hover:shadow-teal-600/40 hover:-translate-y-0.5 transition-all duration-200 text-center text-lg"
              >
                Sign In to Browse Catalog
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-center flex items-center gap-2 group text-lg"
              >
                Create Account
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all duration-200" />
              </Link>
            </div>
          </div>

          {/* Right: Hero Cards */}
          <div className="w-full max-w-lg mx-auto lg:mr-0">
            <div className="relative w-full rounded-3xl bg-white/60 backdrop-blur-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col justify-center p-8 gap-6">
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
              <div className="absolute w-64 h-64 bg-gradient-to-tr from-teal-200 to-indigo-200 rounded-full blur-3xl opacity-40 mix-blend-multiply top-0 left-0 pointer-events-none" />
              <div className="absolute w-64 h-64 bg-gradient-to-br from-indigo-200 to-teal-200 rounded-full blur-3xl opacity-40 mix-blend-multiply bottom-0 right-0 pointer-events-none" />

              {HERO_CARDS.map(({ icon: Icon, iconColor, bg, title, sub, shift }) => (
                <div
                  key={title}
                  className={`w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 relative z-10 hover:shadow-md transition-shadow ${shift}`}
                >
                  <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-base leading-tight">{title}</p>
                    <p className="text-sm text-gray-500 mt-1">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST BAR ─────────────────────────────────────────────────── */}
      <section className="bg-teal-50 border-y border-teal-100 py-6">
        <div className="page-wrapper">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-teal-900">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon className="w-6 h-6 text-teal-500" />
                <span className="font-semibold text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ──────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="page-wrapper">
          <div className="flex flex-col items-center justify-center max-w-2xl mx-auto mb-20 pt-12 pb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Why choose RxGuardian?</h2>
            <p className="text-gray-500 text-lg text-center">We bridge the gap between clinical expertise and digital convenience.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {FEATURES.map(({ icon: Icon, iconColor, bg, title, desc }) => (
              <div key={title} className="p-10 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${bg} mb-8`}>
                  <Icon className={`w-8 h-8 ${iconColor}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-600 leading-relaxed text-base">{desc}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Separation before footer */}
        <div className="w-full h-16" />
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-gray-200 py-14 bg-gray-100">
        <div className="page-wrapper grid grid-cols-1 md:grid-cols-3 gap-12 text-sm text-gray-600">
          {/* Company Info */}
          <div className="flex flex-col gap-2">
            <span className="font-bold text-gray-900 text-xl mb-2">RxGuardians</span>
            <span>AI-Powered Pharmacy Assistant</span>
            <span>Smarter Healthcare, Delivered Faster.</span>
            <span className="mt-2 text-xs text-gray-500">© {new Date().getFullYear()} RxGuardians. All rights reserved.</span>
          </div>
          {/* Links */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray-900 mb-2">Quick Links</span>
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contact Support</a>
            <a href="/login" className="hover:text-gray-900 transition-colors">Sign In</a>
            <a href="/register" className="hover:text-gray-900 transition-colors">Create Account</a>
          </div>
          {/* Contact */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray-900 mb-2">Contact</span>
            <span>Email: <a href="mailto:support@rxguardians.com" className="hover:text-gray-900 transition-colors">support@rxguardians.com</a></span>
            <span>Phone: <a href="tel:+18001234567" className="hover:text-gray-900 transition-colors">+1 800 123 4567</a></span>
            <span>Address: 123 Health Ave, Wellness City, Country</span>
          </div>
        </div>
      </footer>
    </div>
  );
}