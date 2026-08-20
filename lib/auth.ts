import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "admin_session";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET não configurado");
  return secret;
}

function sign(value: string) {
  const hmac = crypto.createHmac("sha256", getSecret());
  hmac.update(value);
  return hmac.digest("hex");
}

export function createSessionToken(username: string) {
  const payload = `${username}:${Date.now()}`;
  const signature = sign(payload);
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export function readSessionToken(token: string | undefined): { username: string } | null {
  if (!token) return null;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;
  const payload = Buffer.from(payloadB64, "base64url").toString();
  const expected = sign(payload);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  const [username] = payload.split(":");
  return { username };
}

export function isValidSessionToken(token: string | undefined) {
  return readSessionToken(token) !== null;
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}

export function isLoggedIn() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return isValidSessionToken(token);
}

export function currentUsername() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return readSessionToken(token)?.username ?? null;
}
