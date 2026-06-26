export interface ICategory {
    _id: string;
    name: string;
    status: boolean;
    movieCount?: number;
    createAt?: string;
    updateAt?: string;
}