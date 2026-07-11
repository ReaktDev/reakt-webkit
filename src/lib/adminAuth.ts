const ADMIN_SESSION_KEY = 'reakt-webkit-admin-session';
const LEGACY_AUTH_KEY = 'reakt-sitekit-admin-auth';
const LEGACY_PASSWORD_KEY = 'reakt-sitekit-admin-password';

type AdminLoginResult = {
  ok: boolean;
  message?: string;
};

const adminAuthEndpoints = ['/api/admin-auth', '/.netlify/functions/admin-auth'];
const adminSessionEndpoints = ['/api/admin-session', '/.netlify/functions/admin-session'];

const postJson = async <T>(endpoint: string, body: unknown, token?: string): Promise<{ status: number; data: T }> => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as T;
  return { status: response.status, data };
};

const getSessionToken = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(ADMIN_SESSION_KEY) || '';
};

export const clearAdminSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ADMIN_SESSION_KEY);
  window.localStorage.removeItem(LEGACY_AUTH_KEY);
  window.localStorage.removeItem(LEGACY_PASSWORD_KEY);
};

export const hasAdminSession = () => Boolean(getSessionToken());

export const loginToAdmin = async (password: string): Promise<AdminLoginResult> => {
  const trimmedPassword = password.trim();

  for (const endpoint of adminAuthEndpoints) {
    try {
      const { status, data } = await postJson<{ token?: string; error?: string }>(endpoint, {
        password: trimmedPassword,
      });

      if (status === 200 && data.token) {
        window.localStorage.setItem(ADMIN_SESSION_KEY, data.token);
        window.localStorage.removeItem(LEGACY_AUTH_KEY);
        window.localStorage.removeItem(LEGACY_PASSWORD_KEY);
        return { ok: true };
      }

      if (status === 401) {
        return { ok: false, message: data.error || 'Wrong password.' };
      }

      if (status === 200 && !data.token) {
        continue;
      }

      if (status !== 404) {
        return { ok: false, message: data.error || 'Admin auth is not configured correctly.' };
      }
    } catch {
      // Try the next hosting adapter before deciding whether this is local development.
    }
  }

  if (import.meta.env.DEV && trimmedPassword === 'demo') {
    window.localStorage.setItem(ADMIN_SESSION_KEY, 'dev-demo');
    window.localStorage.removeItem(LEGACY_AUTH_KEY);
    window.localStorage.removeItem(LEGACY_PASSWORD_KEY);
    return { ok: true };
  }

  return {
    ok: false,
    message: import.meta.env.DEV
      ? 'Wrong password. Local development uses the demo password.'
      : 'Admin auth endpoint is missing. Deploy with ADMIN_PASSWORD and ADMIN_SESSION_SECRET.',
  };
};

export const verifyAdminSession = async () => {
  const token = getSessionToken();

  if (!token) {
    clearAdminSession();
    return false;
  }

  if (import.meta.env.DEV && token === 'dev-demo') {
    return true;
  }

  for (const endpoint of adminSessionEndpoints) {
    try {
      const { status, data } = await postJson<{ valid?: boolean }>(endpoint, { token }, token);

      if (status === 200) {
        if (data.valid) {
          return true;
        }
        clearAdminSession();
        return false;
      }
    } catch {
      // Try the next hosting adapter.
    }
  }

  clearAdminSession();
  return false;
};
