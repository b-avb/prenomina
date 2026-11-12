/// <reference types="vite/client" />

/**
 * Build-time environment overrides exposed by Vite.
 * Omitted Microsoft Entra settings fall back at runtime to `GET /api/auth/config`.
 */
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_AUTH_MODE?: 'local' | 'hybrid' | 'microsoft';
  readonly VITE_AZURE_TENANT_ID?: string;
  readonly VITE_MSAL_TENANT_ID?: string;
  readonly VITE_AZURE_CLIENT_ID?: string;
  readonly VITE_MSAL_CLIENT_ID?: string;
  readonly VITE_AZURE_API_SCOPE?: string;
  readonly VITE_MSAL_API_SCOPE?: string;
  readonly VITE_AZURE_REDIRECT_URI?: string;
  readonly VITE_MSAL_REDIRECT_URI?: string;
  readonly VITE_AZURE_POST_LOGOUT_REDIRECT_URI?: string;
  readonly VITE_MSAL_CACHE_LOCATION?: 'sessionStorage' | 'localStorage';
  readonly VITE_INSTITUTIONAL_EMAIL_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
