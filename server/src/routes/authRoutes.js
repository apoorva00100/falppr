import { Router } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { buildAuthorizeUrl, exchangeCodeForUser } from "../auth/github.js";
import { createSessionToken, verifySessionToken, sessionCookieOptions, SESSION_COOKIE } from "../auth/session.js";
import { createUser, findUserByEmail } from "../auth/userStore.js";

export const authRoutes = Router();
const STATE_COOKIE = "memex_oauth_state";

function toSessionUser(record) {
  return {
    id: `email:${record.id}`,
    login: record.email,
    name: record.name || record.email.split("@")[0],
    avatarUrl: null
  };
}

authRoutes.get("/github", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  res.cookie(STATE_COOKIE, state, { httpOnly: true, sameSite: "lax", maxAge: 5 * 60 * 1000, path: "/" });
  res.redirect(buildAuthorizeUrl(state));
});

authRoutes.get("/github/callback", async (req, res) => {
  const { code, state } = req.query;
  const expectedState = req.cookies?.[STATE_COOKIE];
  res.clearCookie(STATE_COOKIE, { path: "/" });

  if (!code || !state || state !== expectedState) {
    return res.status(400).send("OAuth state mismatch — please try signing in again.");
  }

  try {
    const user = await exchangeCodeForUser(code);
    const token = createSessionToken(user);
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
    res.redirect("/#app");
  } catch (error) {
    console.error("[auth] GitHub sign-in failed:", error);
    res.status(500).send("GitHub sign-in failed. Please try again.");
  }
});

authRoutes.post("/signup", async (req, res, next) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || typeof email !== "string" || !password || password.length < 8) {
      return res.status(400).json({ error: "Email and a password of at least 8 characters are required" });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const record = await createUser({ email, passwordHash, name });
    const user = toSessionUser(record);
    const token = createSessionToken(user);
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

authRoutes.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const record = await findUserByEmail(email);
    const valid = record && (await bcrypt.compare(password, record.passwordHash));
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = toSessionUser(record);
    const token = createSessionToken(user);
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

authRoutes.get("/me", (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  const user = token && verifySessionToken(token);
  if (!user) return res.status(401).json({ error: "Not signed in" });
  res.json({ user });
});

authRoutes.post("/logout", (req, res) => {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.json({ ok: true });
});
