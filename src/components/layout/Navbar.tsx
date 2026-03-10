'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        router.replace('/login');
    };

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/tasks', label: 'Tasks' },
        ...(user?.role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
    ];

    return (
        <nav className="border-b border-gray-200 bg-white px-6 py-3">
            <div className="flex items-center justify-between">

                {/* Logo */}
                <Link
                    href="/dashboard"
                    className="text-lg font-bold text-blue-600"
                >
                    TMS
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-medium transition hover:text-blue-600
                                ${pathname === link.href
                                    ? 'text-blue-600'
                                    : 'text-gray-600'
                                }
                            `}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* User Info + Logout */}
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Logout
                    </button>
                </div>

            </div>
        </nav>
    );
}