// ⚠️ AGNOSTIC — JWT helpers (decode exp claim only)

export function getAccessTokenExpirySeconds(accessToken: string): number | null {
  try {
    const [, payloadSegment] = accessToken.split(".");
    if (!payloadSegment) return null;

    const payload = JSON.parse(atob(payloadSegment)) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(accessToken: string): boolean {
  const exp = getAccessTokenExpirySeconds(accessToken);
  if (!exp) return true;
  return Date.now() >= exp * 1000;
}

export function getRefreshDelayMs(
  accessToken: string,
  refreshBeforeSeconds = 60,
): number | null {
  const exp = getAccessTokenExpirySeconds(accessToken);
  if (!exp) return null;

  const refreshAtMs = (exp - refreshBeforeSeconds) * 1000;
  return Math.max(0, refreshAtMs - Date.now());
}
