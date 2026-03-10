'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getAllTasksAdmin, deleteTaskAdmin } from '@/lib/adminService';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { TaskStatus } from '@/types';
import toast from 'react-hot-toast';

export default function AdminPage() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<TaskStatus | ''>('');
    const [search, setSearch] = useState('');

    // ── Role Guard ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (user && user.role !== 'admin') {
            toast.error('Access denied');
            router.replace('/dashboard');
        }
    }, [user, router]);

    // ── Fetch All Tasks ────────────────────────────────────────────────────────
    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'tasks', { page, status, search }],
        queryFn: () => getAllTasksAdmin({ page, limit: 10, status, search }),
        enabled: user?.role === 'admin',
    });

    const tasks = data?.data ?? [];
    const meta = data?.meta;

    // ── Delete Task ────────────────────────────────────────────────────────────
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteTaskAdmin(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'tasks'] });
            toast.success('Task deleted by admin!');
        },
        onError: () => toast.error('Failed to delete task'),
    });

    // ── Guard Render ───────────────────────────────────────────────────────────
    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="p-6">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500">Manage all users&apos; tasks</p>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap gap-3">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search tasks..."
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
                />
                <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value as TaskStatus | ''); setPage(1); }}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
                >
                    <option value="">All Status</option>
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                </select>
            </div>

            {/* Tasks Table */}
            {isLoading ? (
                <p className="text-gray-500">Loading...</p>
            ) : tasks.length === 0 ? (
                <p className="text-gray-500">No tasks found.</p>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Priority</th>
                                <th className="px-4 py-3">User ID</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tasks.map((task) => (
                                <tr key={task.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {task.title}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium
                                            ${task.status === 'todo' ? 'bg-gray-100 text-gray-600' : ''}
                                            ${task.status === 'in-progress' ? 'bg-blue-100 text-blue-600' : ''}
                                            ${task.status === 'done' ? 'bg-green-100 text-green-600' : ''}
                                        `}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium
                                            ${task.priority === 'low' ? 'bg-gray-100 text-gray-600' : ''}
                                            ${task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : ''}
                                            ${task.priority === 'high' ? 'bg-red-100 text-red-600' : ''}
                                        `}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {task.userId}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => deleteMutation.mutate(task.id)}
                                            disabled={deleteMutation.isPending}
                                            className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {page} of {meta.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                        disabled={page === meta.totalPages}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

        </div>
    );
}