import { Router } from "express";
import crypto from "crypto";
import { buildAuthorizeUrl, exchangeCodeForUser } from "../auth/github.js";
import { createSessionToken, verifySessionToken, sessionCookieOptions, SESSION_COOKIE } from "../auth/session.js";

export const authRoutes = Router();
const STATE_COOKIE = "memex_oauth_state";

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
