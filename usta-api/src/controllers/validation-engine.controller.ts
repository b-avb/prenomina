import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ActorContext } from '@usta/domain';
import { assertUnitAccess } from '../auth/actor-resolver.js';
import type { ValidationEngineService } from '../services/validation-engine.service.js';
import { type RouteParams, sendSuccess } from '../utils/http.utils.js';
import { optionalQueryParam, requirePathParam } from '../validation/query-params.js';

/**
 * HTTP handler evaluating institutional compliance rules (`Acuerdo No. 48 de 2025`, Annexes 4–7)
 * for a single academic unit. Enforces Dean tenant scope via `assertUnitAccess`.
 */
export class ValidationEngineController {
  constructor(private readonly service: ValidationEngineService) {}

  public getUnitValidation = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
    params: RouteParams,
    actor?: ActorContext,
  ): Promise<void> => {
    const unitId = requirePathParam(params, 'id', { maxLength: 64 });
    if (actor) {
      assertUnitAccess(actor, unitId);
    }
    const period = optionalQueryParam(url, 'period', req);
    const summary = await this.service.evaluateFacultyUnit(unitId, period);
    sendSuccess(res, 200, summary);
  };
}
