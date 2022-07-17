import { HandlerContext } from "$fresh/server.ts";

import { getLoginCookie, setLoginCookie } from "../../../utils/cookie.ts";
import { LoginUser } from "../../../models/user.ts";
import { googleOAuthConfig } from "../../../utils/oauth_config.ts";

export const handler = async (
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
  const loginCookie = getLoginCookie(req.headers);
  const loginUser: LoginUser = JSON.parse(atob(loginCookie));

  if (!loginUser.refreshToken) {
    return new Response(JSON.stringify({ error: "REFRESH_TOKEN_IS_NONE" }), {
      status: 401,
    });
  }

  const newLoginUser = await refreshGoogleToken(loginUser);

  const headers = new Headers();
  setLoginCookie(headers, newLoginUser);
  return new Response(null, { status: 200, headers });
};

const refreshGoogleToken = async (loginUser: LoginUser): Promise<LoginUser> => {
  const refreshTokenForm = new FormData();
  refreshTokenForm.append("client_id", googleOAuthConfig.clientId);
  refreshTokenForm.append("client_secret", googleOAuthConfig.clientSecret);
  refreshTokenForm.append("grant_type", "refresh_token");
  refreshTokenForm.append("refresh_token", loginUser.refreshToken!);
  const refreshTokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: refreshTokenForm,
  });

  const refreshToken = await refreshTokenRes.json();

  return {
    ...loginUser,
    accessToken: refreshToken.access_token,
    idToken: refreshToken.id_token,
  };
};
