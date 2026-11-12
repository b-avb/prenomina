import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ActorContext, CreatePeriodDto } from '@usta/domain';
import { ROLE_PERMISSIONS, type ActorResolver } from '../auth/actor-resolver.js';
import { ENV_CONFIG } from '../config/env.config.js';
import type { PayrollStateService } from '../services/payroll-state.service.js';
import { ForbiddenError } from '../utils/app-error.js';
import { type RouteParams, readJsonBody, sendSuccess } from '../utils/http.utils.js';
import { PayloadReader } from '../validation/payload-reader.js';
import { optionalQueryParam } from '../validation/query-params.js';

/**
 * HTTP handlers for MariaDB connectivity health checks, consolidated period state snapshots,
 * academic period cloning/activation, and gated non-production database resets.
 */
export class PayrollStateController {
  constructor(
    private readonly service: PayrollStateService,
    private readonly actorResolver: ActorResolver,
  ) {}

  public getHealth = async (_req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const health = await this.service.getHealth();
    sendSuccess(res, 200, health);
  };

  /** Returns the consolidated state snapshot for `?period=` (or the active period), filtered to the caller's unit scope. */
  public getState = async (
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
    _params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor = resolvedActor ?? (await this.actorResolver.resolve(req));
    const period = optionalQueryParam(url, 'period', req);
    const snapshot = await this.service.getSnapshot(period, actor);
    sendSuccess(res, 200, snapshot);
  };

  public listPeriods = async (
    _req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> => {
    const periods = await this.service.listPeriods();
    sendSuccess(res, 200, periods);
  };

  /** Activates an existing academic period or clones a new period (`YYYY-1`/`YYYY-2`) from `sourcePeriod`. */
  public createPeriod = async (
    req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    _params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor =
      resolvedActor ??
      (await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management));
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<CreatePeriodDto>(raw, (r) => ({
      code: r.requiredString('code', { maxLength: 16 }),
      sourcePeriod: r.requiredString('sourcePeriod', { maxLength: 16 }),
      resetStatuses: r.requiredBoolean('resetStatuses'),
    }));
    const created = await this.service.createOrClonePeriod(actor, dto);
    sendSuccess(res, 201, created);
  };

  /**
   * Truncates and reseeds the database to baseline institutional catalogs.
   * Unconditionally rejected in `NODE_ENV=production` and unless `ALLOW_DESTRUCTIVE_STATE_RESET=true`.
   */
  public resetState = async (
    req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    _params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    if (
      ENV_CONFIG.nodeEnv === 'production' ||
      process.env.ALLOW_DESTRUCTIVE_STATE_RESET !== 'true'
    ) {
      throw new ForbiddenError(
        'El reinicio destructivo de la base de datos está deshabilitado por seguridad.',
      );
    }
    const actor =
      resolvedActor ??
      (await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management));
    const snapshot = await this.service.resetToSeed(actor);
    sendSuccess(res, 200, snapshot);
  };
}
