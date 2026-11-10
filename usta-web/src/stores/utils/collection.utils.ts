/** Small helpers to reconcile store collections with server-returned entities. */

interface Identified {
  id: string;
}

export function findIndexById<T extends Identified>(list: T[], id: string): number {
  return list.findIndex((item) => item.id === id);
}

/** Replaces the entity with the same id; returns false when it is not in the list. */
export function replaceById<T extends Identified>(list: T[], entity: T): boolean {
  const index = findIndexById(list, entity.id);
  if (index < 0) return false;
  list[index] = entity;
  return true;
}

/** Replaces the entity with the same id or inserts it at the given edge. */
export function upsertById<T extends Identified>(
  list: T[],
  entity: T,
  insertAt: 'start' | 'end' = 'end',
): void {
  if (replaceById(list, entity)) return;
  if (insertAt === 'start') list.unshift(entity);
  else list.push(entity);
}

export function removeById<T extends Identified>(list: T[], id: string): void {
  const index = findIndexById(list, id);
  if (index >= 0) list.splice(index, 1);
}

/** Re-inserts a removed entity at its original position (used by optimistic rollbacks). */
export function restoreAt<T>(list: T[], index: number, entity: T): void {
  list.splice(Math.min(Math.max(index, 0), list.length), 0, entity);
}
