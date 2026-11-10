import type { IncomingMessage, ServerResponse } from 'node:http';
import type { AuditService } from '../services/audit.service.js';
import { sendSuccess } from '../utils/http.utils.js';
import {
  optionalIntQueryParam,
  optionalQueryParam,
} from '../validation/query-params.js';

export class AuditLogsController {
  constructor(private readonly service: AuditService) {}

  public list = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
  ): Promise<void> => {
    const period = optionalQueryParam(url, 'period', req);
    const unitId = optionalQueryParam(url, 'unitId');
    const limit = optionalIntQueryParam(url, 'limit', { min: 1, max: 1000 });
    const logs = await this.service.list({
      ...(period !== undefined ? { period } : {}),
      ...(unitId !== undefined ? { unitId } : {}),
      ...(limit !== undefined ? { limit } : {}),
    });
    sendSuccess(res, 200, logs);
  };
}
