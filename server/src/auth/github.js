import { env } from "../config/env.js";

const AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const TOKEN_URL = "https://github.com/login/oauth/access_token";
const USER_URL = "https://api.github.com/user";

export function buildAuthorizeUrl(state) {
  const params = new URLSearchParams({
    client_id: env.githubClientId,
    redirect_uri: env.githubCallbackUrl,
    scope: "read:user",
    state
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForUser(code) {
  const tokenResponse = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: env.githubClientId,
      client_secret: env.githubClientSecret,
      code,
      redirect_uri: env.githubCallbackUrl
    })
  });
  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    throw new Error(tokenData.error_description || "GitHub token exchange failed");
  }

  const userResponse = await fetch(USER_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: "application/vnd.github+json" }
  });
  if (!userResponse.ok) {
    throw new Error(`GitHub user lookup failed: ${userResponse.status}`);
  }

  const profile = await userResponse.json();
  return {
    id: `github:${profile.id}`,
    login: profile.login,
    name: profile.name || profile.login,
    avatarUrl: profile.avatar_url
  };
}
