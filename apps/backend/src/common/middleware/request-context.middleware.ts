import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export interface RequestContextStore {
  traceId: string;
  ip: string;
  userAgent: string;
}

export const requestContext = new AsyncLocalStorage<RequestContextStore>();

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request & { id?: string | number }, _res: Response, next: NextFunction) {
    const headerTraceId = req.headers['x-request-id'];
    const traceId = String(
      req.id ?? (Array.isArray(headerTraceId) ? headerTraceId[0] : headerTraceId) ?? randomUUID(),
    );
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = String(
      (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)?.split(',')[0] ??
        req.ip ??
        req.socket.remoteAddress ??
        '',
    );
    const userAgent = String(req.headers['user-agent'] ?? '');

    requestContext.run({ traceId, ip, userAgent }, next);
  }
}
