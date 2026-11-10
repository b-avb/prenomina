import type { IncomingMessage, ServerResponse } from 'node:http';
import type { CreatePeriodDto } from '@usta/domain';
import { ROLE_PERMISSIONS, type ActorResolver } from '../auth/actor-resolver.js';
import { ENV_CONFIG } from '../config/env.config.js';
import type { PayrollStateService } from '../services/payroll-state.service.js';
import { ForbiddenError } from '../utils/app-error.js';
import { readJsonBody, sendSuccess } from '../utils/http.utils.js';
import { PayloadReader } from '../validation/payload-reader.js';
import { optionalQueryParam } from '../validation/query-params.js';

export class PayrollStateController {
  constructor(
    private readonly service: PayrollStateService,
    private readonly actorResolver: ActorResolver,
  ) {}

  public getHealth = async (_req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const health = await this.service.getHealth();
    sendSuccess(res, 200, health);
  };

  public getState = async (
    _req: IncomingMessage,
    res: ServerResponse,
    url: URL,
  ): Promise<void> => {
    const period = optionalQueryParam(url, 'period');
    const snapshot = await this.service.getSnapshot(period);
    sendSuccess(res, 200, snapshot);
  };

  public listPeriods = async (
    _req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> => {
    const periods = await this.service.listPeriods();
    sendSuccess(res, 200, periods);
  };

  public createPeriod = async (
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management);
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<CreatePeriodDto>(raw, (r) => ({
      code: r.requiredString('code', { maxLength: 16 }),
      sourcePeriod: r.requiredString('sourcePeriod', { maxLength: 16 }),
      resetStatuses: r.requiredBoolean('resetStatuses'),
    }));
    const created = await this.service.createOrClonePeriod(actor, dto);
    sendSuccess(res, 201, created);
  };

  public resetState = async (
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> => {
    if (ENV_CONFIG.nodeEnv === 'production') {
      throw new ForbiddenError(
        'El reinicio completo de la base de datos está deshabilitado en producción.',
      );
    }
    await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management);
    const snapshot = await this.service.resetToSeed();
    sendSuccess(res, 200, snapshot);
  };
}
