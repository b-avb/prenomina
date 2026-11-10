import type { IncomingMessage, ServerResponse } from 'node:http';
import type {
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
import { PAYROLL_ROLES } from '../validation/domain-enums.js';
import { PayloadReader } from '../validation/payload-reader.js';
import { requirePathParam } from '../validation/query-params.js';

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
    authRateLimiter.assertNotBlocked(req, 'microsoft-entra-sso');
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<MicrosoftLoginDto>(raw, (r) => ({
      ...(r.has('idToken')
        ? { idToken: r.optionalString('idToken', { maxLength: 16384 }) }
        : {}),
      ...(r.has('accessToken')
        ? { accessToken: r.optionalString('accessToken', { maxLength: 16384 }) }
        : {}),
    }));
    try {
      const session = await this.service.loginWithMicrosoft(dto);
      authRateLimiter.recordSuccess(req, 'microsoft-entra-sso');
      sendSuccess(res, 200, session);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        authRateLimiter.recordFailure(req, 'microsoft-entra-sso');
      }
      throw error;
    }
  };

  public me = async (
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, undefined, {
      allowPendingPasswordChange: true,
    });
    const user = await this.service.getMe(actor.userId ?? '');
    sendSuccess(res, 200, user);
  };

  public changePassword = async (
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, undefined, {
      allowPendingPasswordChange: true,
    });
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
  ): Promise<void> => {
    await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management);
    const users = await this.service.listUsers();
    sendSuccess(res, 200, users);
  };

  public createUser = async (
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management);
    const raw = await readJsonBody(req);
    const dto = PayloadReader.parse<CreateUserAccountDto>(raw, (r) => ({
      username: r.requiredString('username', { maxLength: 80 }),
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
  ): Promise<void> => {
    const actor = await this.actorResolver.resolve(req, ROLE_PERMISSIONS.management);
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
