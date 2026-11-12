import type { IncomingMessage, ServerResponse } from 'node:http';
import type {
  ActorContext,
  ChangePasswordDto,
  CreateUserAccountDto,
  LoginDto,
  MicrosoftLoginDto,
  ResetUserPasswordDto,
} from '@usta/domain';
import {
  ROLE_PERMISSIONS,
  type ActorResolver,
} from '../auth/actor-resolver.js';
import { authRateLimiter } from '../auth/rate-limiter.js';
import type { AuthService } from '../services/auth.service.js';
import { UnauthorizedError } from '../utils/app-error.js';
import {
  type RouteParams,
  readJsonBody,
  sendSuccess,
} from '../utils/http.utils.js';
import { AUTH_PROVIDERS, PAYROLL_ROLES } from '../validation/domain-enums.js';
import { PayloadReader } from '../validation/payload-reader.js';
import { requirePathParam } from '../validation/query-params.js';

function extractUnverifiedTokenSubjectHint(rawToken: string | undefined): string {
  if (!rawToken) return 'microsoft-entra-sso';
  const parts = rawToken.split('.');
  if (parts.length !== 3 || !parts[1]) return 'microsoft-entra-sso';
  try {
    const parsed = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf8'),
    ) as Record<string, unknown>;
    const candidate =
      parsed.preferred_username ?? parsed.email ?? parsed.upn ?? parsed.oid;
    if (typeof candidate === 'string' && candidate.trim()) {
      return `ms:${candidate.trim().toLowerCase().slice(0, 80)}`;
    }
  } catch {
    // Ignore malformed JWT hint before signature verification
  }
  return 'microsoft-entra-sso';
}

export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly actorResolver: ActorResolver,
  ) {}

  public config = async (
    _req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> => {
    const authConfig = this.service.getAuthConfig();
    sendSuccess(res, 200, authConfig);
  };

  public login = async (
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> => {
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<LoginDto>(raw, (r) => ({
      username: r.requiredString('username', { maxLength: 120 }),
      password: r.requiredString('password', { maxLength: 200 }),
    }));
    authRateLimiter.assertNotBlocked(req, dto.username);
    try {
      const session = await this.service.login(dto);
      authRateLimiter.recordSuccess(req, dto.username);
      sendSuccess(res, 200, session);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        authRateLimiter.recordFailure(req, dto.username);
      }
      throw error;
    }
  };

  public loginWithMicrosoft = async (
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> => {
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<MicrosoftLoginDto>(raw, (r) => ({
      ...(r.has('idToken')
        ? { idToken: r.optionalString('idToken', { maxLength: 16384 }) }
        : {}),
      ...(r.has('accessToken')
        ? { accessToken: r.optionalString('accessToken', { maxLength: 16384 }) }
        : {}),
    }));
    const rateKey = extractUnverifiedTokenSubjectHint(dto.idToken || dto.accessToken);
    authRateLimiter.assertNotBlocked(req, rateKey);
    try {
      const session = await this.service.loginWithMicrosoft(dto);
      authRateLimiter.recordSuccess(req, rateKey);
      sendSuccess(res, 200, session);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        authRateLimiter.recordFailure(req, rateKey);
      }
      throw error;
    }
  };

  public me = async (
    req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    _params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor =
      resolvedActor ??
      (await this.actorResolver.resolve(req, undefined, {
        allowPendingPasswordChange: true,
      }));
    const user = await this.service.getMe(actor.userId ?? '');
    sendSuccess(res, 200, user);
  };

  public changePassword = async (
    req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    _params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor =
      resolvedActor ??
      (await this.actorResolver.resolve(req, undefined, {
        allowPendingPasswordChange: true,
      }));
    const identifier = actor.username ?? actor.userId ?? 'change-password';
    authRateLimiter.assertNotBlocked(req, identifier);

    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<ChangePasswordDto>(raw, (r) => ({
      currentPassword: r.requiredString('currentPassword', { maxLength: 200 }),
      newPassword: r.requiredString('newPassword', { maxLength: 200 }),
    }));
    try {
      const session = await this.service.changePassword(actor.userId ?? '', dto);
      authRateLimiter.recordSuccess(req, identifier);
      sendSuccess(res, 200, session);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        authRateLimiter.recordFailure(req, identifier);
      }
      throw error;
    }
  };

  public listUsers = async (
    req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    _params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    if (!resolvedActor) {
      await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management);
    }
    const users = await this.service.listUsers();
    sendSuccess(res, 200, users);
  };

  public createUser = async (
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
    const dto = PayloadReader.parse<CreateUserAccountDto>(raw, (r) => ({
      username: r.requiredString('username', { maxLength: 80 }),
      ...(r.has('email')
        ? { email: r.optionalString('email', { maxLength: 160 }) }
        : {}),
      ...(r.has('authProvider')
        ? { authProvider: r.optionalEnum('authProvider', AUTH_PROVIDERS) }
        : {}),
      fullName: r.requiredString('fullName', { maxLength: 180 }),
      role: r.requiredEnum('role', PAYROLL_ROLES),
      ...(r.has('unitId')
        ? { unitId: r.optionalNullableString('unitId', { maxLength: 64 }) }
        : {}),
      ...(r.has('temporaryPassword')
        ? {
            temporaryPassword: r.optionalString('temporaryPassword', {
              maxLength: 120,
            }),
          }
        : {}),
    }));
    const created = await this.service.createUser(actor, dto);
    sendSuccess(res, 201, created);
  };

  public resetUserPassword = async (
    req: IncomingMessage,
    res: ServerResponse,
    _url: URL,
    params: RouteParams,
    resolvedActor?: ActorContext,
  ): Promise<void> => {
    const actor =
      resolvedActor ??
      (await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management));
    const id = requirePathParam(params, 'id', { maxLength: 64 });
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<ResetUserPasswordDto>(raw, (r) => ({
      id,
      ...(r.has('temporaryPassword')
        ? {
            temporaryPassword: r.optionalString('temporaryPassword', {
              maxLength: 120,
            }),
          }
        : {}),
    }));
    const result = await this.service.resetPasswordToTemporary(actor, dto);
    sendSuccess(res, 200, result);
  };
}
