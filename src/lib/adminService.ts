import api from '@/lib/api';
import { ITask, IPaginatedResponse, ITaskQueryParams } from '@/types';

// ─── Get All Tasks (Admin) ────────────────────────────────────────────────────
export const getAllTasksAdmin = async (
    params: ITaskQueryParams = {}
): Promise<IPaginatedResponse<ITask>['data']> => {
    const response = await api.get<IPaginatedResponse<ITask>>('/admin/tasks', { params });
    return response.data.data;
};

// ─── Delete Task (Admin) ──────────────────────────────────────────────────────
export const deleteTaskAdmin = async (id: number, force = false): Promise<void> => {
    await api.delete(`/admin/tasks/${id}`, { params: { force } });
};

// ─── Delete Comment (Admin) ───────────────────────────────────────────────────
export const deleteCommentAdmin = async (id: number, force = false): Promise<void> => {
    await api.delete(`/admin/comments/${id}`, { params: { force } });
};