'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getAllTasks } from '@/lib/taskService';
import Link from 'next/link';

export default function DashboardPage() {
    const { user } = useAuth();

    const { data, isLoading } = useQuery({
        queryKey: ['tasks', 'dashboard'],
        queryFn: () => getAllTasks({ page: 1, limit: 100 }),
    });

    const tasks = data?.data ?? [];

    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;

    return (
        <div className="p-6">

            {/* Welcome */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-sm text-gray-500">
                    Here&apos;s a summary of your tasks
                </p>
            </div>

            {/* Stats Cards */}
            {isLoading ? (
                <p className="text-gray-500">Loading...</p>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {/* Todo */}
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500">To Do</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{todoCount}</p>
                        <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                            todo
                        </span>
                    </div>

                    {/* In Progress */}
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500">In Progress</p>
                        <p className="mt-2 text-3xl font-bold text-blue-600">{inProgressCount}</p>
                        <span className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600">
                            in-progress
                        </span>
                    </div>

                    {/* Done */}
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500">Done</p>
                        <p className="mt-2 text-3xl font-bold text-green-600">{doneCount}</p>
                        <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-1 text-xs text-green-600">
                            done
                        </span>
                    </div>

                </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8 flex gap-4">
                <Link
                    href="/tasks"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                    View All Tasks
                </Link>
                {user?.role === 'admin' && (
                    <Link
                        href="/admin"
                        className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
                    >
                        Admin Panel
                    </Link>
                )}
            </div>

        </div>
    );
}