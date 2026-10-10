export interface FieldError {
  field?: string;
  message: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: FieldError[];
  path: string;
  timestamp: string;
}
