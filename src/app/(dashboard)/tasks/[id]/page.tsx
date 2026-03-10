'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTaskById, updateTask, deleteTask, addComment, getTaskComments } from '@/lib/taskService';
import { TaskStatus, TaskPriority } from '@/types';
import toast from 'react-hot-toast';

export default function TaskDetailPage() {
    const { id } = useParams();
    const taskId = Number(id);
    const router = useRouter();
    const queryClient = useQueryClient();

    // ── Fetch Task ─────────────────────────────────────────────────────────────
    const { data: task, isLoading: taskLoading } = useQuery({
        queryKey: ['task', taskId],
        queryFn: () => getTaskById(taskId),
    });

    // ── Fetch Comments ─────────────────────────────────────────────────────────
    const { data: commentsData } = useQuery({
        queryKey: ['comments', taskId],
        queryFn: () => getTaskComments(taskId),
    });
    const comments = commentsData?.data ?? [];

    // ── Edit Task ──────────────────────────────────────────────────────────────
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editStatus, setEditStatus] = useState<TaskStatus>('todo');
    const [editPriority, setEditPriority] = useState<TaskPriority>('low');
    const [editDescription, setEditDescription] = useState('');

    const startEditing = () => {
        if (!task) return;
        setEditTitle(task.title);
        setEditStatus(task.status);
        setEditPriority(task.priority);
        setEditDescription(task.description ?? '');
        setIsEditing(true);
    };

    const updateMutation = useMutation({
        mutationFn: () => updateTask(taskId, {
            title: editTitle,
            status: editStatus,
            priority: editPriority,
            description: editDescription,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task updated!');
            setIsEditing(false);
        },
        onError: () => toast.error('Failed to update task'),
    });

    // ── Delete Task ────────────────────────────────────────────────────────────
    const deleteMutation = useMutation({
        mutationFn: () => deleteTask(taskId),
        onSuccess: () => {
            toast.success('Task deleted!');
            router.replace('/tasks');
        },
        onError: () => toast.error('Failed to delete task'),
    });

    // ── Add Comment ────────────────────────────────────────────────────────────
    const [commentText, setCommentText] = useState('');

    const commentMutation = useMutation({
        mutationFn: () => addComment(taskId, { text: commentText }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
            toast.success('Comment added!');
            setCommentText('');
        },
        onError: () => toast.error('Failed to add comment'),
    });

    const handleComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) {
            toast.error('Comment cannot be empty');
            return;
        }
        commentMutation.mutate();
    };

    // ── Loading ────────────────────────────────────────────────────────────────
    if (taskLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-500">Loading task...</p>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-500">Task not found.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl p-6">

            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="mb-4 text-sm text-blue-600 hover:underline"
            >
                ← Back to Tasks
            </button>

            {/* Task Card */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">

                {!isEditing ? (
                    <>
                        {/* View Mode */}
                        <div className="mb-4 flex items-start justify-between">
                            <h1 className="text-xl font-bold text-gray-900">{task.title}</h1>
                            <div className="flex gap-2">
                                <button
                                    onClick={startEditing}
                                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteMutation.mutate()}
                                    disabled={deleteMutation.isPending}
                                    className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        {task.description && (
                            <p className="mb-4 text-sm text-gray-600">{task.description}</p>
                        )}

                        <div className="flex gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium
                                ${task.status === 'todo' ? 'bg-gray-100 text-gray-600' : ''}
                                ${task.status === 'in-progress' ? 'bg-blue-100 text-blue-600' : ''}
                                ${task.status === 'done' ? 'bg-green-100 text-green-600' : ''}
                            `}>
                                {task.status}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium
                                ${task.priority === 'low' ? 'bg-gray-100 text-gray-600' : ''}
                                ${task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : ''}
                                ${task.priority === 'high' ? 'bg-red-100 text-red-600' : ''}
                            `}>
                                {task.priority}
                            </span>
                        </div>

                        {task.dueDate && (
                            <p className="mt-3 text-xs text-gray-500">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                        )}
                    </>
                ) : (
                    <>
                        {/* Edit Mode */}
                        <p className="mb-4 font-semibold text-gray-700">Edit Task</p>

                        <div className="space-y-3">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
                                placeholder="Task title"
                            />
                            <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
                                placeholder="Description (optional)"
                                rows={3}
                            />
                            <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
                            >
                                <option value="todo">Todo</option>
                                <option value="in-progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                            <select
                                value={editPriority}
                                onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => updateMutation.mutate()}
                                disabled={updateMutation.isPending}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {updateMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Comments Section */}
            <div className="mt-6">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                    Comments ({comments.length})
                </h2>

                {/* Add Comment */}
                <form onSubmit={handleComment} className="mb-4">
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
                        disabled={commentMutation.isPending}
                    />
                    <button
                        type="submit"
                        disabled={commentMutation.isPending}
                        className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {commentMutation.isPending ? 'Adding...' : 'Add Comment'}
                    </button>
                </form>

                {/* Comments List */}
                {comments.length === 0 ? (
                    <p className="text-sm text-gray-500">No comments yet.</p>
                ) : (
                    <div className="space-y-3">
                        {comments.map((comment) => (
                            <div
                                key={comment.id}
                                className="rounded-xl bg-white p-4 shadow-sm border border-gray-100"
                            >
                                <p className="text-sm text-gray-700">{comment.text}</p>
                                <p className="mt-1 text-xs text-gray-400">
                                    {new Date(comment.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}