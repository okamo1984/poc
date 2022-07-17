import { HandlerContext } from "$fresh/server.ts";
import { googleOAuthConfig } from "../../../../utils/oauth_config.ts";
import { setLoginCookie } from "../../../../utils/cookie.ts";
import { HOME_URL } from "../../../../utils/constants.ts";

export const handler = async (
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
  const code = new URL(req.url).searchParams.get("code");
  if (!code) {
    return new Response("code is not in url");
  }
  const accessTokenForm = new FormData();
  accessTokenForm.append("client_id", googleOAuthConfig.clientId);
  accessTokenForm.append("client_secret", googleOAuthConfig.clientSecret);
  accessTokenForm.append("code", code);
  accessTokenForm.append("grant_type", "authorization_code");
  accessTokenForm.append("redirect_uri", googleOAuthConfig.redirectUrl);
  const accessTokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: accessTokenForm,
    headers: {
      Accept: "application/json",
    },
  });

  const accessToken = await accessTokenRes.json();

  const userRes = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken.access_token}`,
      },
    },
  );

  const user = await userRes.json();

  const headers = new Headers({
    location: HOME_URL,
  });

  setLoginCookie(headers, {
    provider: "google",
    id: user.email,
    email: user.email,
    name: user.name,
    avatarUrl: user.picture,
    accessToken: accessToken.access_token,
    refreshToken: accessToken.refresh_token,
    idToken: accessToken.id_token,
  });
  const res = new Response(null, {
    status: 302,
    headers,
  });
  return res;
};
