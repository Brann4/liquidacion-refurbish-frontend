export interface BaseResponse<T> {
    status: boolean;
    msg: string;
    value: T | null;
}
