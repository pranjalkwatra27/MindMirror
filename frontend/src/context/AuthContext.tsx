'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';

interface User {
    id: string;
    name: string;
    email: string;
    targetRole?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        try {
            const savedToken = Cookies.get('evolveai_token');
            if (savedToken) {
                setToken(savedToken);
                const data = await api.getProfile() as { user: User };
                setUser(data.user);
            }
        } catch {
            Cookies.remove('evolveai_token');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = async (email: string, password: string) => {
        const data = await api.login(email, password) as { token: string; user: User };
        Cookies.set('evolveai_token', data.token, { expires: 7 });
        setToken(data.token);
        setUser(data.user);
    };

    const register = async (name: string, email: string, password: string) => {
        const data = await api.register(name, email, password) as { token: string; user: User };
        Cookies.set('evolveai_token', data.token, { expires: 7 });
        setToken(data.token);
        setUser(data.user);
    };

    const logout = () => {
        Cookies.remove('evolveai_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
