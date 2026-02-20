# 🛡️ RxGuardian Frontend — Update Guide

> **For contributors who clone this repo.** This document lists all new files, components, and setup steps added in this update.

---

## ⚙️ Setup After Cloning

```bash
cd frontend
npm install
cp .env.local.example .env.local  # then fill in your Supabase keys
npm run dev
```

### Required Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 📁 New Files Added

### Components (`src/components/`)

| File | Purpose |
|------|---------|
| `AddToCartButton.tsx` | Client Component — "Add to Cart" button used on the product details page. Split out to allow the parent page to stay a Server Component. |
| `AuthModal.tsx` | Glassmorphism Login/Signup modal. Uses `ReactDOM.createPortal` to render at `document.body` level (escaping the fixed header). |
| `CartDrawer.tsx` | Slide-in shopping cart panel. Also uses `createPortal`. Displays cart items, quantity controls, remove buttons, and totals. |
| `Toast.tsx` | Lightweight toast notification shown when a product is added to the cart. Auto-dismisses after 3 seconds. |
| `Header.tsx` | Updated — now a **Client Component** (`"use client"`). Includes cart icon with badge, user avatar (opens AuthModal), mobile hamburger menu, and CartDrawer. |
| `ProductCard.tsx` | Updated — now a **Client Component** (`"use client"`). Includes "Add" button with `stopPropagation` to prevent link navigation on button click. |

### Context (`src/context/`)

| File | Purpose |
|------|---------|
| `CartContext.tsx` | Global cart state via React Context API. Supports `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`. Persists to `localStorage`. Renders Toast on item add. |

### Pages (`src/app/`)

| File | Purpose |
|------|---------|
| `page.tsx` | Home — **Client Component**. Fetches products from Supabase. Includes live search input and category filter chips (ALL / ASPIRIN / IBUPROFEN / PARACETAMOL). Product cards navigate to details page. |
| `product/[id]/page.tsx` | Dynamic product details — **Server Component**. Fetches a single product by ID from Supabase. Uses `AddToCartButton` for cart interaction. |
| `orders/page.tsx` | Order History — **Server Component**. Fetches all orders from Supabase and displays them in a styled table. |
| `dashboard/page.tsx` | Analysis — **Server Component**. Computes total orders, revenue, unique patients, and top-selling product from Supabase order data. Renders a bar chart and status panel. |

### Types & Lib (`src/types/`, `src/lib/`)

| File | Purpose |
|------|---------|
| `types/index.ts` | Shared `Product` interface with exact Supabase column names (e.g. `"product id"`, `"price rec"`). |
| `lib/supabase.ts` | Supabase client singleton initialized with env vars. |

---

## 🔑 Key Architecture Notes

### Client vs Server Components

Next.js Server Components cannot use React Hooks. Components that need `useState`, `useEffect`, or Context must be marked `"use client"`.

| Component | Type | Reason |
|-----------|------|--------|
| `Header` | Client | Uses `useState` for mobile menu and cart/auth open state |
| `ProductCard` | Client | Uses `useCart()` context hook |
| `AddToCartButton` | Client | Uses `useCart()` context hook |
| `CartDrawer` | Client | Uses `useCart()` + `useState` for mount state |
| `AuthModal` | Client | Uses `useState` + `useEffect` for body scroll lock |
| `CartContext` | Client | Entire context is client-side |
| `app/page.tsx` (Home) | Client | Uses `useState` + `useEffect` for search/filter |
| `product/[id]/page.tsx` | Server | Data fetched server-side; uses client `AddToCartButton` |
| `orders/page.tsx` | Server | Pure data display |
| `dashboard/page.tsx` | Server | Pure data display |

### Portal Pattern (`createPortal`)

Both `AuthModal` and `CartDrawer` render via `ReactDOM.createPortal(jsx, document.body)`.  
**Why:** They are rendered inside `<Header>` which has `position: fixed; top: 0`. A `fixed` child inside a `fixed` parent gets constrained to the parent's bounds. By portaling to `document.body`, the modals are always viewport-centered/full-height regardless of where they are rendered in the component tree.

### Supabase Column Names

The `products` table uses **spaced column names**. Always use bracket notation:

```ts
product["product id"]       
product["product name"]     
product["price rec"]        
product["package size"]     
product["descriptions"]     
product.productId           
```

The `orders` table similarly uses capitalized string keys:

```ts
order["Patient ID"]
order["Product Name"]
order["Total Price (EUR)"]
order["Quantity"]           
order["Purchase Date"]      
```

---

## 🗂️ Full File Tree

```
src/
├── app/
│   ├── layout.tsx              # Root layout + CartProvider wrapper
│   ├── globals.css             # Global styles + glassmorphism utilities
│   ├── page.tsx                # Home / Pharmacy Catalog (Client)
│   ├── orders/
│   │   └── page.tsx            # Order History (Server)
│   ├── dashboard/
│   │   └── page.tsx            # Analysis Dashboard (Server)
│   └── product/
│       └── [id]/
│           └── page.tsx        # Product Details (Server + Client Button)
├── components/
│   ├── Header.tsx              # Navigation, Cart, Auth triggers (Client)
│   ├── ProductCard.tsx         # Product display card (Client)
│   ├── AddToCartButton.tsx     # Cart CTA for product detail page (Client)
│   ├── CartDrawer.tsx          # Cart sidebar drawer via portal (Client)
│   ├── AuthModal.tsx           # Login/Signup overlay via portal (Client)
│   └── Toast.tsx               # Notification toast (Client)
├── context/
│   └── CartContext.tsx         # Cart global state + Toast renderer (Client)
├── lib/
│   └── supabase.ts             # Supabase client
└── types/
    └── index.ts                # Product interface
```
