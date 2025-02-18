import { Request } from 'express';

export interface ClientInfo {
  userIp: string;
  userAgent: string;
}

export function getClientInfo(req: Request): ClientInfo {
  const forwardedFor = req.headers['x-forwarded-for'] as string;

  const userIp: string = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : req.connection?.remoteAddress || req.socket?.remoteAddress || 'N/A';

  const userAgent = req.get('User-Agent') || 'N/A';

  return { userIp, userAgent };
}
