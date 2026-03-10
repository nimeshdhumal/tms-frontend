'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';

interface IDashboardLayoutProps {
    readonly children: React.ReactNode;
}

export default function DashboardLayout({ children }: IDashboardLayoutProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    //Show nothing while checking auth
    if (isLoading) {
        return (
            <div className='flex min-h-screen items-center justify-center'>
                <p className='text-grey-500'>Loading...</p>
            </div>
        );
    }

    //Show nothing while redirecting
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="mx-auto max-w-5xl py-6 px-4">
                {children}
            </main>
        </div>
    );
}