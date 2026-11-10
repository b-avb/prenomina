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
    config: () => http.get<AuthConfigResponse>('/api/auth/config'),
    login: (dto: LoginDto) =>
      http.post<AuthSessionResponse>('/api/auth/login', dto),
    loginWithMicrosoft: (dto: MicrosoftLoginDto) =>
      http.post<AuthSessionResponse>('/api/auth/microsoft', dto),
    me: () => http.get<AuthUser>('/api/auth/me'),
    changePassword: (dto: ChangePasswordDto) =>
      http.post<AuthSessionResponse>('/api/auth/change-password', dto),
    listUsers: () => http.get<UserListResponse>('/api/users'),
    createUser: (dto: CreateUserAccountDto) =>
      http.post<ResetUserPasswordResponse>('/api/users', dto),
    resetUserPassword: (id: string, temporaryPassword?: string) =>
      http.post<ResetUserPasswordResponse>(
        `/api/users/${encodeURIComponent(id)}/reset-password`,
        temporaryPassword ? { temporaryPassword } : {},
      ),
  };
}
