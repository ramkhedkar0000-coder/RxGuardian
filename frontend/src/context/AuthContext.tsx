"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'patient' | 'guest';
}

interface AuthContextType {
    user: User | null;
    login: (email: string, role: 'admin' | 'patient') => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check local storage for persisted session
        const storedUser = localStorage.getItem('rx_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, role: 'admin' | 'patient') => {
        setIsLoading(true);
        // Mock authentication
        // In real app, call backend API
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

        let mockUser: User;

        if (role === 'admin') {
            mockUser = {
                id: 'ADMIN-001',
                name: 'Dr. Admin',
                email: email,
                role: 'admin'
            };
            if (email !== 'admin@rxguardians.com') { // simple check
                setIsLoading(false);
                return false;
            }
        } else {
            mockUser = {
                id: 'PATIENT-001',
                name: 'John Doe',
                email: email,
                role: 'patient'
            };
        }

        setUser(mockUser);
        localStorage.setItem('rx_user', JSON.stringify(mockUser));

        // Redirect based on role
        if (role === 'admin') {
            router.push('/admin/dashboard');
        } else {
            router.push('/browse');
        }

        setIsLoading(false);
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('rx_user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
