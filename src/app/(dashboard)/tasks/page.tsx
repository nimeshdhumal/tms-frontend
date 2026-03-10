'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllTasks, createTask, deleteTask } from '@/lib/taskService';
import { ICreateTaskInput, TaskStatus } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function TasksPage() {
    const queryClient = useQueryClient();

    // ── Filters ────────────────────────────────────────────────────────────────
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<TaskStatus | ''>('');
    const [page, setPage] = useState(1);

    // ── Fetch Tasks ────────────────────────────────────────────────────────────
    const { data, isLoading } = useQuery({
        queryKey: ['tasks', { search, status, page }],
        queryFn: () => getAllTasks({ search, status, page, limit: 10 }),
    });

    const tasks = data?.data ?? [];
    const meta = data?.meta;

    // ── Create Task ────────────────────────────────────────────────────────────
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');

    const createMutation = useMutation({
        mutationFn: (data: ICreateTaskInput) => createTask(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task created!');
            setTitle('');
            setShowForm(false);
        },
        onError: () => toast.error('Failed to create task'),
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }
        createMutation.mutate({ title });
    };

    // ── Delete Task ────────────────────────────────────────────────────────────
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task deleted!');
        },
        onError: () => toast.error('Failed to delete task'),
    });

    return (
        <div className="p-6">

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                    {showForm ? 'Cancel' : '+ New Task'}
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <form onSubmit={handleCreate} className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
                    <p className="mb-3 font-semibold text-gray-700">Create New Task</p>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Task title..."
                            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
                            disabled={createMutation.isPending}
                        />
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {createMutation.isPending ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            )}

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

            {/* Tasks List */}
            {isLoading ? (
                <p className="text-gray-500">Loading tasks...</p>
            ) : tasks.length === 0 ? (
                <p className="text-gray-500">No tasks found.</p>
            ) : (
                <div className="space-y-3">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-100"
                        >
                            {/* Task Info */}
                            <div>
                                <Link
                                    href={`/tasks/${task.id}`}
                                    className="font-semibold text-gray-900 hover:text-blue-600"
                                >
                                    {task.title}
                                </Link>
                                <div className="mt-1 flex gap-2">
                                    {/* Status Badge */}
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium
                                        ${task.status === 'todo' ? 'bg-gray-100 text-gray-600' : ''}
                                        ${task.status === 'in-progress' ? 'bg-blue-100 text-blue-600' : ''}
                                        ${task.status === 'done' ? 'bg-green-100 text-green-600' : ''}
                                    `}>
                                        {task.status}
                                    </span>
                                    {/* Priority Badge */}
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium
                                        ${task.priority === 'low' ? 'bg-gray-100 text-gray-600' : ''}
                                        ${task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : ''}
                                        ${task.priority === 'high' ? 'bg-red-100 text-red-600' : ''}
                                    `}>
                                        {task.priority}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Link
                                    href={`/tasks/${task.id}`}
                                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                >
                                    View
                                </Link>
                                <button
                                    onClick={() => deleteMutation.mutate(task.id)}
                                    disabled={deleteMutation.isPending}
                                    className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
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