import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types";

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch('http://localhost:3001/api/products', {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error('Failed to fetch data');
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-grow pt-24 pb-12 px-6">
        <div className="container mx-auto">
          <section className="text-center mb-16">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-6 py-2">
              Your Health, Guarded by AI
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Experience the future of pharmacy with RXGuardians.
              Intelligent refills, instant ordering, and personalized care.
            </p>
          </section>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-slate-100">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <h2 className="text-2xl font-semibold text-slate-700">Connecting to Pharmacy...</h2>
              <p className="text-slate-500 mt-2">Make sure the backend server is running on port 3001.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product["product id"]} className="h-full">
                  {/* Pass individual product to client component if needed, 
                       but ProductCard acts as a server component wrapper here effectively */}
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="glass-header mt-auto py-8">
        <div className="container mx-auto text-center text-slate-500">
          <p>© 2026 RXGuardians. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
