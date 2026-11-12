import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ActorContext } from '@usta/domain';
import type { AuditService } from '../services/audit.service.js';
import { type RouteParams, sendSuccess } from '../utils/http.utils.js';
import {
  optionalIntQueryParam,
  optionalQueryParam,
} from '../validation/query-params.js';

/**
 * Read-only HTTP handler for querying the append-only audit trail.
 * Caps page size at 1,000 entries and delegates Dean unit scoping to `AuditService`.
 */
export class AuditLogsController {
  constructor(private readonly service: AuditService) {}

  public list = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
    _params: RouteParams,
    actor?: ActorContext,
  ): Promise<void> => {
    const period = optionalQueryParam(url, 'period', req);
    const unitId = optionalQueryParam(url, 'unitId');
    const limit = optionalIntQueryParam(url, 'limit', { min: 1, max: 1000 });
    const logs = await this.service.list({
      ...(period !== undefined ? { period } : {}),
      ...(unitId !== undefined ? { unitId } : {}),
      ...(limit !== undefined ? { limit } : {}),
      ...(actor ? { actor } : {}),
    });
    sendSuccess(res, 200, logs);
  };
}
