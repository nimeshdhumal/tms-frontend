'use client';
/* Info: This file stores the logged-in user and token globally — so any component in your app can access them without prop drilling. */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { IUser } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface IAuthContext {
    user: IUser | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setAuth: (token: string, user: IUser) => void;
    logout: () => void;
}

// ─── Create Context ───────────────────────────────────────────────────────────
const AuthContext = createContext<IAuthContext | undefined>(undefined);

// ─── Props ────────────────────────────────────────────────────────────────────
interface IAuthProviderProps {
    readonly children: React.ReactNode;
}

// ─── Provider ───────────────────────────────────────────────────────────
export function AuthProvider({ children }: IAuthProviderProps) {
    const [user, setUser] = useState<IUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Load from localStorage on app start
    useEffect(() => {
        const storedToken = localStorage.getItem('tms_token');
        const storedUser = localStorage.getItem('tms_user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (error) {
                // If JSON.parse fails, clear corrupted data
                console.error('Corrupted auth data in localStorage:', error);
                localStorage.removeItem('tms_token');
                localStorage.removeItem('tms_user');
            }
        }
        setIsLoading(false);
    }, []);

    // Save token and user after login
    const setAuth = useCallback((newToken: string, newUser: IUser) => {
        localStorage.setItem('tms_token', newToken);
        localStorage.setItem('tms_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    }, []);

    // Clear everything on logout
    const logout = useCallback(() => {
        localStorage.removeItem('tms_token');
        localStorage.removeItem('tms_user');
        setToken(null);
        setUser(null);
    }, []);

    const contextValue = useMemo(() => ({
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        setAuth,
        logout,
    }), [user, token, isLoading, setAuth, logout]);

    return (<AuthContext.Provider value={contextValue}> {children} </AuthContext.Provider>);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): IAuthContext {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}