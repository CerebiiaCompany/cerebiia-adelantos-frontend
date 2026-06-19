import { describe, expect, it } from "vitest";
import {
  getAccessTokenExpirySeconds,
  getRefreshDelayMs,
  isAccessTokenExpired,
} from "./jwt";
describe("jwt helpers", () => {
  it("reads exp claim from access token", () => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ exp: 1_700_000_000 }));
    const token = `${header}.${payload}.signature`;

    expect(getAccessTokenExpirySeconds(token)).toBe(1_700_000_000);
  });

  it("returns refresh delay relative to current time", () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ exp: nowSeconds + 120 }));
    const token = `${header}.${payload}.signature`;

    const delay = getRefreshDelayMs(token, 60);
    expect(delay).not.toBeNull();
    expect(delay!).toBeGreaterThan(0);
    expect(delay!).toBeLessThanOrEqual(60_000);
  });

  it("treats undecodable tokens as expired", () => {
    expect(isAccessTokenExpired("demo-access-token")).toBe(true);
  });
});
