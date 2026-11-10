/**
 * Port for identifier generation (Dependency Inversion Principle).
 * The domain never decides how identifiers are produced: the backend injects a
 * UUID-based implementation, keeping identity generation server-authoritative.
 */
export interface IdGenerator {
  next(): string;
}
