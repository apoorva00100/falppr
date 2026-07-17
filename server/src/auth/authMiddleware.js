import { SESSION_COOKIE, verifySessionToken } from "./session.js";

export function requireAuth(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  const user = token && verifySessionToken(token);
  if (!user) {
    return res.status(401).json({ error: "Sign in required" });
  }
  req.user = user;
  next();
}
