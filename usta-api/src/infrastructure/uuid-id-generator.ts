import { randomUUID } from 'node:crypto';
import type { IdGenerator } from '@usta/domain';

/** Server-authoritative identity generation (RFC 4122 v4 UUIDs). */
export class UuidIdGenerator implements IdGenerator {
  public next(): string {
    return randomUUID();
  }
}
