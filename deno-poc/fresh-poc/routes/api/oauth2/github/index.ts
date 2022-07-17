import { HandlerContext } from "$fresh/server.ts";
import { githubOAuthConfig } from "../../../../utils/oauth_config.ts";

const issuer = new URL("https://github.com/login/oauth/authorize");

const redirectUri = githubOAuthConfig.redirectUrl;

export const handler = (_req: Request, _ctx: HandlerContext): Response => {
  const authorizationUrl = new URL(issuer);
  authorizationUrl.searchParams.set("client_id", githubOAuthConfig.clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("scope", "user:email");
  return Response.redirect(authorizationUrl, 302);
};
