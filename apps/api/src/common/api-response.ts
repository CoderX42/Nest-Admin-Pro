export class ApiResponse<T = any> {
  code: number;
  data: T | null;
  message: string;

  constructor(code = 200, data: T | null = null, message = 'success') {
    this.code = code;
    this.data = data;
    this.message = message;
  }

  static success<T>(data?: T, message = 'success') {
    return new ApiResponse(200, data, message);
  }

  static error(message = 'Internal server error', code = 500) {
    return new ApiResponse(code, null, message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiResponse(401, null, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiResponse(403, null, message);
  }

  static notFound(message = 'Not found') {
    return new ApiResponse(404, null, message);
  }

  static badRequest(message = 'Bad request') {
    return new ApiResponse(400, null, message);
  }
}