import api from '@/lib/api';
import {
    ITask, ICreateTaskInput, IUpdateTaskInput, IComment,
    ICreateCommentInput, IPaginatedResponse, ITaskQueryParams
} from '@/types';

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const createTask = async (data: ICreateTaskInput): Promise<ITask> => {
    const response = await api.post<{ success: boolean; data: ITask }>('/tasks', data);
    return response.data.data;
};

export const getAllTasks = async (params: ITaskQueryParams = {}): Promise<IPaginatedResponse<ITask>['data']> => {
    const response = await api.get<IPaginatedResponse<ITask>>('/tasks', { params });
    return response.data.data;
};

export const getTaskById = async (id: number): Promise<ITask> => {
    const response = await api.get<{ success: boolean; data: ITask }>(`/tasks/${id}`);
    return response.data.data;
};

export const updateTask = async (id: number, data: IUpdateTaskInput): Promise<ITask> => {
    const response = await api.patch<{ success: boolean; data: ITask }>(`/tasks/${id}`, data);
    return response.data.data;
};

export const deleteTask = async (id: number, force = false): Promise<void> => {
    await api.delete(`/tasks/${id}`, { params: { force } });
};

// ─── Comments ─────────────────────────────────────────────────────────────────

export const addComment = async (taskId: number, data: ICreateCommentInput): Promise<IComment> => {
    const response = await api.post<{ success: boolean; data: IComment }>(`/tasks/${taskId}/comments`, data);
    return response.data.data;
};

export const getTaskComments = async (
    taskId: number,
    page = 1,
    limit = 10
): Promise<IPaginatedResponse<IComment>['data']> => {
    const response = await api.get<IPaginatedResponse<IComment>>(
        `/tasks/${taskId}/comments`,
        { params: { page, limit } }
    );
    return response.data.data;
};