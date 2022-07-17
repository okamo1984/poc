export const githubOAuthConfig = {
  clientId: Deno.env.get("GITHUB_CLIENT_ID") ?? "",
  clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET") ?? "",
  redirectUrl: Deno.env.get("GITHUB_REDIRECT_URI") ??
    "http://localhost:8000/api/oauth2/github/callback",
};

export const googleOAuthConfig = {
  clientId: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
  clientSecret: Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "",
  redirectUrl: Deno.env.get("GOOGLE_REDIRECT_URI") ??
    "http://localhost:8000/api/oauth2/google/callback",
};
