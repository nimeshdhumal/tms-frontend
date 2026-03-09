/* User & Auth */
export type UserRole = 'admin' | 'user';

export interface IUser {
    id: number;
    name: string;
    email: string;
    user: UserRole;
    createdAt: string;
    updatedAt: string;
}

export interface ILoginInput {
    email: string;
    password: string;
}

export interface ISignUpInput {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

/* Tasks */

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type SortOrder = 'asc' | 'desc';

export interface ITask {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
}

export interface ICreateTaskInput {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
}

export interface IUpdateTaskInput extends Partial<ICreateTaskInput> { }

/* Comments */

export interface IComment {
    id:number;
    text:string;
    taskId:number;
    userId:number;
    createdAt:string;
    updatedAt:string;
}

export interface ICreateCommentInput{
    text:string;
}

/* API Response Shapes */

export interface IPagination{
    page:number;
    limit:number;
    total:number;
    totalPages:number;
}