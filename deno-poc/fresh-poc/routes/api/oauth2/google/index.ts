import { HandlerContext } from "$fresh/server.ts";
import { googleOAuthConfig } from "../../../../utils/oauth_config.ts";

const issuer = new URL("https://accounts.google.com/o/oauth2/v2/auth");

const redirectUri = googleOAuthConfig.redirectUrl;

const scopes = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/cloud-platform",
];

const prompts = ["consent", "select_account"];

export const handler = (_req: Request, _ctx: HandlerContext): Response => {
  const authorizationUrl = new URL(issuer);
  authorizationUrl.searchParams.set("client_id", googleOAuthConfig.clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("scope", scopes.join(" "));
  authorizationUrl.searchParams.set("include_granted_scopes", "true");
  authorizationUrl.searchParams.set("access_type", "offline");
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("prompt", prompts.join(" "));
  return Response.redirect(authorizationUrl, 302);
};
