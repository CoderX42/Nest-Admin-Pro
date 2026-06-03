export const ERROR_CODES = {
  success: 200,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  tooManyRequests: 429,
  internalError: 500,
} as const;

export type ErrorCodeKey = keyof typeof ERROR_CODES;
