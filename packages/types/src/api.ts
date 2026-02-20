export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail: string;
  code?: string;
  issues?: Array<{
    message: string;
    path: string[];
    type: string;
  }>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  code?: string;
}
