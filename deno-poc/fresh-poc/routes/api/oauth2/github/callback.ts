import { HandlerContext } from "$fresh/server.ts";
import { githubOAuthConfig } from "../../../../utils/oauth_config.ts";
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
  accessTokenForm.append("client_id", githubOAuthConfig.clientId);
  accessTokenForm.append("client_secret", githubOAuthConfig.clientSecret);
  accessTokenForm.append("code", code);
  const accessTokenRes = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      body: accessTokenForm,
      headers: {
        Accept: "application/json",
      },
    },
  );

  const accessToken = await accessTokenRes.json();

  const userRes = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      Authorization: `token ${accessToken}`,
    },
  });

  const user = await userRes.json();

  const headers = new Headers({
    location: HOME_URL,
  });
  setLoginCookie(headers, {
    provider: "github",
    id: user.login,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    accessToken: accessToken.access_token,
  });
  const res = new Response(null, {
    status: 302,
    headers,
  });
  return res;
};
