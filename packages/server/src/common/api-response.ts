/**
 * Standardized API response format
 */
export class ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;

  private constructor(ok: boolean, data?: T, error?: string) {
    this.ok = ok;
    this.data = data;
    this.error = error;
  }

  /**
   * Create a successful response with data
   */
  static success<T>(data: T): ApiResponse<T> {
    return new ApiResponse<T>(true, data);
  }

  /**
   * Create an error response with an error message
   */
  static error<T>(error: string): ApiResponse<T> {
    return new ApiResponse<T>(false, undefined, error);
  }
} 