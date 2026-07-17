import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const SESSION_COOKIE = "memex_session";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function createSessionToken(user) {
  return jwt.sign(user, env.sessionSecret, { expiresIn: "30d" });
}

export function verifySessionToken(token) {
  try {
    return jwt.verify(token, env.sessionSecret);
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProduction,
    maxAge: MAX_AGE_MS,
    path: "/"
  };
}
