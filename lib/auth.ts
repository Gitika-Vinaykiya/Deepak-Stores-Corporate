import { cookies } from "next/headers";
import { randomBytes } from "crypto";

const ADMIN_COOKIE = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// In-memory store: cleared when server restarts, so user must re-login
const validTokens = new Set<string>();

export async function verifyAdminPassword(password: string): Promise<{ valid: boolean; noPasswordConfigured?: boolean }> {
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const trimmedInput = password?.trim() ?? "";
  if (!adminPassword) return { valid: false, noPasswordConfigured: true };
  return { valid: trimmedInput === adminPassword };
}

export async function setAdminSession() {
  const token = randomBytes(32).toString("hex");
  validTokens.add(token);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (token) validTokens.delete(token);
  cookieStore.delete(ADMIN_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return !!(token && validTokens.has(token));
}
