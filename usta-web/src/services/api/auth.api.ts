import type {
  AuthConfigResponse,
  AuthSessionResponse,
  AuthUser,
  ChangePasswordDto,
  CreateUserAccountDto,
  LoginDto,
  MicrosoftLoginDto,
  ResetUserPasswordResponse,
  UserListResponse,
} from '@usta/domain';
import type { HttpClient } from '../api.client';

export function createAuthApi(http: HttpClient) {
  return {
    /** GET /api/auth/config — returns runtime auth mode and public Microsoft Entra ID settings. */
    config: () => http.get<AuthConfigResponse>('/api/auth/config'),
    /** POST /api/auth/login — authenticates local username/email and password credentials. */
    login: (dto: LoginDto) =>
      http.post<AuthSessionResponse>('/api/auth/login', dto),
    /** POST /api/auth/microsoft — exchanges Microsoft Entra ID tokens for an institutional session. */
    loginWithMicrosoft: (dto: MicrosoftLoginDto) =>
      http.post<AuthSessionResponse>('/api/auth/microsoft', dto),
    /** GET /api/auth/me — revalidates the stored Bearer token and returns the active actor profile. */
    me: () => http.get<AuthUser>('/api/auth/me'),
    /** POST /api/auth/change-password — rotates local credentials and clears `mustChangePassword`. */
    changePassword: (dto: ChangePasswordDto) =>
      http.post<AuthSessionResponse>('/api/auth/change-password', dto),
    /** GET /api/users — lists provisioned institutional accounts (executive roles). */
    listUsers: () => http.get<UserListResponse>('/api/users'),
    /** POST /api/users — provisions an account and returns a one-time temporary password if local. */
    createUser: (dto: CreateUserAccountDto) =>
      http.post<ResetUserPasswordResponse>('/api/users', dto),
    /** POST /api/users/:id/reset-password — issues a temporary password and flags rotation on next login. */
    resetUserPassword: (id: string, temporaryPassword?: string) =>
      http.post<ResetUserPasswordResponse>(
        `/api/users/${encodeURIComponent(id)}/reset-password`,
        temporaryPassword ? { temporaryPassword } : {},
      ),
  };
}
