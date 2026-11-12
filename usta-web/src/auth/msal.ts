import {
  PublicClientApplication,
  LogLevel,
  type AuthenticationResult,
} from '@azure/msal-browser';
import {
  INSTITUTIONAL_EMAIL_DOMAIN,
  type AuthConfigResponse,
  type AuthMode,
  type MicrosoftLoginDto,
} from '@usta/domain';
import { detectAppBasePath } from '@/services/api.client';

export interface MsalRuntimeConfig {
  authMode: AuthMode;
  enabled: boolean;
  tenantId: string;
  clientId: string;
  apiScope: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  cacheLocation: 'sessionStorage' | 'localStorage';
  institutionalDomain: string;
}

type ViteEnvStringKey = Exclude<keyof ImportMetaEnv, 'DEV' | 'PROD' | 'SSR'>;

function readViteEnv(keys: readonly ViteEnvStringKey[], fallback = ''): string {
  for (const key of keys) {
    const raw = import.meta.env[key];
    if (typeof raw === 'string' && raw.trim() !== '') {
      return raw.trim();
    }
  }
  return fallback;
}

/**
 * Build-time Microsoft Entra ID settings for USTA Tunja institutional SSO.
 * Merged with runtime values from `GET /api/auth/config` in `resolveMsalRuntimeConfig`.
 */
export const MSAL_CONFIG = {
  tenantId: readViteEnv(['VITE_AZURE_TENANT_ID', 'VITE_MSAL_TENANT_ID']),
  clientId: readViteEnv(['VITE_AZURE_CLIENT_ID', 'VITE_MSAL_CLIENT_ID']),
  apiScope: readViteEnv(['VITE_AZURE_API_SCOPE', 'VITE_MSAL_API_SCOPE']),
};

/**
 * Resolves effective Microsoft Entra ID settings using precedence:
 * `VITE_*` build-time env vars -> `GET /api/auth/config` payload -> subpath-aware defaults.
 */
export function resolveMsalRuntimeConfig(
  backendConfig?: AuthConfigResponse | null,
): MsalRuntimeConfig {
  const tenantId =
    MSAL_CONFIG.tenantId || backendConfig?.microsoftEntra.tenantId || '';
  const clientId =
    MSAL_CONFIG.clientId || backendConfig?.microsoftEntra.clientId || '';
  const apiScope =
    MSAL_CONFIG.apiScope || backendConfig?.microsoftEntra.apiScope || '';

  const rawViteMode = readViteEnv(['VITE_AUTH_MODE']).toLowerCase();
  let authMode: AuthMode;
  if (
    rawViteMode === 'local' ||
    rawViteMode === 'hybrid' ||
    rawViteMode === 'microsoft'
  ) {
    authMode = rawViteMode;
  } else if (backendConfig?.authMode) {
    authMode = backendConfig.authMode;
  } else {
    authMode = tenantId && clientId ? 'hybrid' : 'local';
  }

  const rawCache = readViteEnv(
    ['VITE_MSAL_CACHE_LOCATION'],
    backendConfig?.microsoftEntra.cacheLocation ?? 'sessionStorage',
  );
  const cacheLocation: 'sessionStorage' | 'localStorage' =
    rawCache === 'localStorage' ? 'localStorage' : 'sessionStorage';

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const defaultLoginUrl = `${origin}${detectAppBasePath()}login`;
  const redirectUri =
    readViteEnv(['VITE_AZURE_REDIRECT_URI', 'VITE_MSAL_REDIRECT_URI']) ||
    defaultLoginUrl;
  const postLogoutRedirectUri =
    readViteEnv(['VITE_AZURE_POST_LOGOUT_REDIRECT_URI']) || defaultLoginUrl;

  const enabled =
    Boolean(tenantId && clientId) &&
    (authMode === 'hybrid' || authMode === 'microsoft');

  return {
    authMode,
    enabled,
    tenantId,
    clientId,
    apiScope,
    redirectUri,
    postLogoutRedirectUri,
    cacheLocation,
    institutionalDomain:
      backendConfig?.microsoftEntra.institutionalDomain ||
      readViteEnv(['VITE_INSTITUTIONAL_EMAIL_DOMAIN'], INSTITUTIONAL_EMAIL_DOMAIN),
  };
}

let cachedMsalInstance: PublicClientApplication | null = null;
let cachedMsalKey = '';

/**
 * Returns an initialized MSAL `PublicClientApplication` singleton, recreating it
 * if tenant, client, or storage cache settings change after backend config loads.
 */
export async function getInitializedMsalClient(
  backendConfig?: AuthConfigResponse | null,
): Promise<{ client: PublicClientApplication; config: MsalRuntimeConfig }> {
  const config = resolveMsalRuntimeConfig(backendConfig);
  const key = `${config.tenantId}:${config.clientId}:${config.cacheLocation}`;

  if (!cachedMsalInstance || cachedMsalKey !== key) {
    cachedMsalInstance = new PublicClientApplication({
      auth: {
        clientId: config.clientId,
        authority: `https://login.microsoftonline.com/${config.tenantId}`,
        redirectUri: config.redirectUri,
        postLogoutRedirectUri: config.postLogoutRedirectUri,
      },
      cache: {
        // Defaults to sessionStorage to isolate MSAL tokens per browser tab unless shared SSO persistence is configured.
        cacheLocation: config.cacheLocation,
      },
      system: {
        loggerOptions: {
          loggerCallback: (level: LogLevel, message: string) => {
            if (import.meta.env.DEV && level <= LogLevel.Warning) {
              console.debug('[MSAL Prenómina]', message);
            }
          },
          logLevel: LogLevel.Warning,
        },
      },
    });
    await cachedMsalInstance.initialize();
    cachedMsalKey = key;
  }

  return { client: cachedMsalInstance, config };
}

/** Builds the OIDC and Microsoft Graph scope list, appending the custom API scope when configured. */
export function buildMsalScopes(config: MsalRuntimeConfig): string[] {
  const scopes = ['openid', 'profile', 'email', 'User.Read'];
  if (config.apiScope && !scopes.includes(config.apiScope)) {
    scopes.push(config.apiScope);
  }
  return scopes;
}

function toMicrosoftLoginDto(result: AuthenticationResult): MicrosoftLoginDto {
  return {
    idToken: result.idToken || undefined,
    accessToken: result.accessToken || undefined,
  };
}

/** Completes any pending Entra ID redirect callback on page load and extracts tokens for backend exchange. */
export async function consumeMicrosoftRedirectResult(
  backendConfig?: AuthConfigResponse | null,
): Promise<MicrosoftLoginDto | null> {
  const config = resolveMsalRuntimeConfig(backendConfig);
  if (!config.enabled) return null;
  const { client } = await getInitializedMsalClient(backendConfig);
  const result = await client.handleRedirectPromise();
  if (!result || (!result.idToken && !result.accessToken)) {
    return null;
  }
  return toMicrosoftLoginDto(result);
}

/** Initiates interactive Entra ID sign-in in a popup window with explicit account selection. */
export async function signInWithMicrosoftPopup(
  backendConfig?: AuthConfigResponse | null,
): Promise<MicrosoftLoginDto> {
  const { client, config } = await getInitializedMsalClient(backendConfig);
  const result = await client.loginPopup({
    scopes: buildMsalScopes(config),
    prompt: 'select_account',
  });
  return toMicrosoftLoginDto(result);
}

/** Initiates full-page Entra ID redirect sign-in when browser popup windows are blocked. */
export async function signInWithMicrosoftRedirect(
  backendConfig?: AuthConfigResponse | null,
): Promise<void> {
  const { client, config } = await getInitializedMsalClient(backendConfig);
  await client.loginRedirect({
    scopes: buildMsalScopes(config),
    prompt: 'select_account',
  });
}
