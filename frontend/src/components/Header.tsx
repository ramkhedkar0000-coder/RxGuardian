import Link from 'next/link';

export function Header() {
    return (
        <header className="glass-header py-4 px-6 fixed top-0 w-full z-10">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
                    RXGuardians
                </Link>
                <nav className="hidden md:flex space-x-6 text-sm font-medium">
                    <Link href="/" className="hover:text-primary transition-colors">Shop</Link>
                    <Link href="/orders" className="hover:text-primary transition-colors">History</Link>
                    <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                </nav>
                <div className="flex items-center space-x-4">
                    <button className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-lg shadow-blue-500/30">
                        Cart (0)
                    </button>
                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                        {/* Placeholder Avatar */}
                        <div className="w-full h-full bg-gradient-to-tr from-blue-400 to-purple-500"></div>
                    </div>
                </div>
            </div>
        </header>
    );
}
