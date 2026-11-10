import type { IncomingMessage } from 'node:http';
import { TooManyRequestsError } from '../utils/app-error.js';

interface AttemptBucket {
  count: number;
  firstAttemptAt: number;
  blockedUntil: number;
}

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const BLOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes lockout after max failures
const MAX_FAILED_ATTEMPTS = 10;
const MAX_BUCKETS = 5000;

export function extractClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  const rawForwarded = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (rawForwarded) {
    const firstIp = rawForwarded.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }
  return req.socket?.remoteAddress || 'unknown-ip';
}

export class AuthRateLimiter {
  private readonly buckets = new Map<string, AttemptBucket>();

  private buildKey(ip: string, identifier: string): string {
    return `${ip.toLowerCase()}::${identifier.trim().toLowerCase()}`;
  }

  private pruneExpired(now: number): void {
    if (this.buckets.size < MAX_BUCKETS) return;
    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.firstAttemptAt > WINDOW_MS && now >= bucket.blockedUntil) {
        this.buckets.delete(key);
      }
    }
  }

  public assertNotBlocked(req: IncomingMessage, identifier: string): void {
    const now = Date.now();
    this.pruneExpired(now);
    const key = this.buildKey(extractClientIp(req), identifier);
    const bucket = this.buckets.get(key);
    if (!bucket) return;

    if (bucket.blockedUntil > now) {
      const remainingSeconds = Math.max(1, Math.ceil((bucket.blockedUntil - now) / 1000));
      throw new TooManyRequestsError(
        `Cuenta temporalmente protegida por exceso de intentos fallidos. Intenta nuevamente en ${remainingSeconds} segundos.`,
      );
    }

    if (now - bucket.firstAttemptAt > WINDOW_MS) {
      this.buckets.delete(key);
    }
  }

  public recordFailure(req: IncomingMessage, identifier: string): void {
    const now = Date.now();
    const key = this.buildKey(extractClientIp(req), identifier);
    const existing = this.buckets.get(key);

    if (!existing || now - existing.firstAttemptAt > WINDOW_MS) {
      this.buckets.set(key, {
        count: 1,
        firstAttemptAt: now,
        blockedUntil: 0,
      });
      return;
    }

    existing.count += 1;
    if (existing.count >= MAX_FAILED_ATTEMPTS) {
      existing.blockedUntil = now + BLOCK_DURATION_MS;
    }
  }

  public recordSuccess(req: IncomingMessage, identifier: string): void {
    const key = this.buildKey(extractClientIp(req), identifier);
    this.buckets.delete(key);
  }
}

export const authRateLimiter = new AuthRateLimiter();
