export declare class ApiResponse<T> {
    ok: boolean;
    data?: T;
    error?: string;
    private constructor();
    static success<T>(data: T): ApiResponse<T>;
    static error<T>(error: string): ApiResponse<T>;
}
