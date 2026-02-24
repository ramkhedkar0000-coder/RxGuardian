"use client";

import React, { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';
import { Product } from '@/types';

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartState {
    items: CartItem[];
}

type CartAction =
    | { type: 'ADD_ITEM'; payload: Product }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
    | { type: 'CLEAR_CART' };

interface CartContextType {
    state: CartState;
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItemIndex = state.items.findIndex(
                item => item.product.id === action.payload.id
            );

            if (existingItemIndex > -1) {
                const newItems = [...state.items];
                const currentQuantity = newItems[existingItemIndex].quantity;
                // Don't exceed stock limit if tracking it
                const limit = action.payload.stock ?? Infinity;
                if (currentQuantity < limit) {
                    newItems[existingItemIndex].quantity += 1;
                }
                return { ...state, items: newItems };
            }

            return { ...state, items: [...state.items, { product: action.payload, quantity: 1 }] };
        }
        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(item => item.product.id !== action.payload)
            };
        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map(item =>
                    item.product.id === action.payload.productId
                        ? { ...item, quantity: Math.max(1, action.payload.quantity) }
                        : item
                )
            };
        case 'CLEAR_CART':
            return { ...state, items: [] };
        default:
            return state;
    }
};

const CART_STORAGE_KEY = 'rxguardian_cart_v2';

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [] });
    const [isMounted, setIsMounted] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        setIsMounted(true);
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Dispatch clear then consecutive adds to ensure data structure integrity 
                // Alternatively, could dispatch a 'HYDRATE' action if reducer supported it. 
                // For simplicity, we just safely parse or default to empty.
                if (parsed && Array.isArray(parsed.items)) {
                    // Manual hydration bypass for brevity, assumes data is valid
                    // In a production app you'd validate the schema
                    parsed.items.forEach((item: CartItem) => {
                        for (let i = 0; i < item.quantity; i++) {
                            dispatch({ type: 'ADD_ITEM', payload: item.product });
                        }
                    })
                }
            }
        } catch (e) {
            console.error("Failed to load cart from storage", e);
        }
    }, []);

    // Save to local storage on state change
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
        }
    }, [state, isMounted]);

    const addItem = (product: Product) => dispatch({ type: 'ADD_ITEM', payload: product });
    const removeItem = (productId: string) => dispatch({ type: 'REMOVE_ITEM', payload: productId });
    const updateQuantity = (productId: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    const clearCart = () => dispatch({ type: 'CLEAR_CART' });

    const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = state.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
