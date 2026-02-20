"use client";

import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const name = product["product name"].toLowerCase();
    const desc = (product["descriptions"] || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || name.includes(query) || desc.includes(query);
    const matchesCategory = activeCategory === "ALL" || name.includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const categories = ["ALL", "ASPIRIN", "IBUPROFEN", "PARACETAMOL"];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20">
      <Header />

      <main className="flex-grow pt-32 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Cinematic Hero Section */}
          <section className="relative text-center mb-16 py-12">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-primary">System Online</span>
              </div>

              <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-foreground mb-8 text-balance">
                Next-Gen <span className="text-primary italic">Pharmacy</span> <br />
                Guarded by AI.
              </h1>

              <div className="max-w-xl mx-auto relative group">
                <input
                  type="text"
                  placeholder="Search medications, descriptions, PZN..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory("ALL"); }}
                  className="w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-border/50 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50 group-focus-within:opacity-100 transition-opacity">
                  ⌘ K
                </div>
              </div>
            </div>
          </section>

          {/* Filtering & Grid */}
          <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-2xl font-bold text-foreground">Available Catalog</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-xl transition-all border ${activeCategory === cat ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground border-border/50 hover:border-primary/50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass-card animate-pulse h-[400px] border border-border/20 rounded-[2rem]" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-32 glass rounded-[2rem] border-dashed border-2 border-border/50">
              <div className="text-5xl mb-6 opacity-40">📡</div>
              <h2 className="text-2xl font-bold text-foreground">No Results Found</h2>
              <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                No medications matched your current criteria or search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Link key={product["product id"]} href={`/product/${product["product id"]}`}>
                  <ProductCard product={product} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border/40 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-foreground">RxGuardian</span>
            <span>OS v1.0.4</span>
          </div>
          <p>© 2026 RxGuardian Technologies. Secured by DeepMind AI.</p>
        </div>
      </footer>
    </div>
  );
}
