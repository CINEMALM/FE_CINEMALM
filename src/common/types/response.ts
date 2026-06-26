export interface TypeMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface TypeResponse<T> {
    data: T;
    message: string;
    meta: null | TypeMeta;
    success: boolean;
}