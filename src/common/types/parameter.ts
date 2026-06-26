export interface IParameter {
    [key: string]: any;
    page?: number | string;
    limit?: number | string;
    total?: number | string;
    totalPage?: number | string;
}