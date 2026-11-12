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

function isLoopbackAddress(addr: string | undefined): boolean {
  if (!addr) return false;
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
}

export function extractClientIp(req: IncomingMessage): string {
  const socketIp = req.socket?.remoteAddress || 'unknown-ip';
  const trustForwarded =
    process.env.TRUST_PROXY === 'true' || isLoopbackAddress(socketIp);
  if (trustForwarded) {
    const forwarded = req.headers['x-forwarded-for'];
    const rawForwarded = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    if (rawForwarded) {
      const firstIp = rawForwarded.split(',')[0]?.trim();
      if (firstIp) return firstIp;
    }
  }
  return socketIp;
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
    while (this.buckets.size >= MAX_BUCKETS) {
      const oldestKey = this.buckets.keys().next().value;
      if (oldestKey === undefined) break;
      this.buckets.delete(oldestKey);
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
        `El acceso se bloqueó temporalmente por intentos fallidos consecutivos. Intente nuevamente en ${remainingSeconds} segundos.`,
      );
    }

    if (now - bucket.firstAttemptAt > WINDOW_MS) {
      this.buckets.delete(key);
    }
  }

  public recordFailure(req: IncomingMessage, identifier: string): void {
    const now = Date.now();
    this.pruneExpired(now);
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
