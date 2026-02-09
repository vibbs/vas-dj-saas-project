/**
 * Error handling for API Client
 * Matches Django REST Framework's Problem Details (RFC 7807) format
 */

export interface ProblemDetails {
  type?: string;
  title?: string;
  status: number;
  code?: string;
  i18n_key?: string;
  detail?: string;
  instance?: string;
  issues?: Array<{
    field?: string;
    code?: string;
    message: string;
  }>;
  [key: string]: unknown;
}

/**
 * Standard API Error class
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details: ProblemDetails | undefined;
  public readonly requestId: string | undefined;

  constructor(
    message: string,
    status: number,
    code: string = 'API_ERROR',
    details?: ProblemDetails,
    requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details ?? undefined;
    this.requestId = requestId ?? undefined;

    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Create ApiError from HTTP Response
   */
  static fromResponse(response: Response, data: unknown): ApiError {
    const requestId = response.headers.get('X-Request-Id') || undefined;

    // Try to parse as Problem Details
    if (data && typeof data === 'object') {
      const problem = data as Partial<ProblemDetails>;

      const message =
        problem.detail ||
        problem.title ||
        `HTTP ${response.status}: ${response.statusText}`;

      const code = problem.code || `HTTP_${response.status}`;

      return new ApiError(
        message,
        response.status,
        code,
        problem as ProblemDetails,
        requestId
      );
    }

    // Fallback for non-standard error responses
    return new ApiError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      `HTTP_${response.status}`,
      undefined,
      requestId
    );
  }

  /**
   * Check if error is a specific type
   */
  public isType(code: string): boolean {
    return this.code === code;
  }

  /**
   * Check if error is validation error
   */
  public isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }

  /**
   * Check if error is authentication error
   */
  public isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Check if error is not found
   */
  public isNotFoundError(): boolean {
    return this.status === 404;
  }

  /**
   * Check if error is server error
   */
  public isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Get validation errors as field map
   */
  public getValidationErrors(): Record<string, string[]> {
    if (!this.details?.issues) {
      return {};
    }

    const errors: Record<string, string[]> = {};

    for (const issue of this.details.issues) {
      const field = issue.field || '_general';
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field]!.push(issue.message);
    }

    return errors;
  }

  /**
   * Format error for display
   */
  public format(): string {
    const parts: string[] = [];

    if (this.code) {
      parts.push(`[${this.code}]`);
    }

    parts.push(this.message);

    if (this.requestId) {
      parts.push(`(Request ID: ${this.requestId})`);
    }

    return parts.join(' ');
  }

  /**
   * Convert to JSON
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
      requestId: this.requestId,
    };
  }
}

/**
 * Helper to format API errors for user display
 */
export function formatApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.format();
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
