export const STATE_COOKIE = "ah_oauth_state";
export const STATE_COOKIE_PATH = "/api/auth/github";
export const DEFAULT_RETURN_TO = "/account";

export const ACCOUNT_ERRORS: Record<string, string> = {
  state_mismatch: "Sign-in expired or was tampered with. Please try again.",
  oauth_denied: "GitHub sign-in was cancelled or denied.",
  oauth_failed: "Sign-in failed. Please try again.",
  not_configured: "GitHub login is not configured on this registry.",
};

export const accountErrorMessage = (code: string) =>
  Object.hasOwn(ACCOUNT_ERRORS, code) ? ACCOUNT_ERRORS[code] : ACCOUNT_ERRORS.oauth_failed;

const BASE = "https://agenthub.invalid";

// Same-site paths only. Resolves like a browser would and keeps just path, query and hash.
export function sanitizeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || /[\u0000-\u0020\u007f-\u009f\\]/.test(value)) {
    return DEFAULT_RETURN_TO;
  }
  try {
    const url = new URL(value, BASE);
    return url.origin === BASE ? url.pathname + url.search + url.hash : DEFAULT_RETURN_TO;
  } catch {
    return DEFAULT_RETURN_TO;
  }
}

export const encodeState = (state: string, returnTo: string) => `${state}:${encodeURIComponent(returnTo)}`;

export function decodeState(cookie: string | undefined): { state: string; returnTo: string } | null {
  if (!cookie) return null;
  const i = cookie.indexOf(":");
  if (i < 1) return null;
  return { state: cookie.slice(0, i), returnTo: sanitizeReturnTo(decodeURIComponent(cookie.slice(i + 1))) };
}
