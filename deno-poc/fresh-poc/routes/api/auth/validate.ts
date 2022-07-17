import { HandlerContext } from "$fresh/server.ts";

import { getLoginCookie } from "../../../utils/cookie.ts";
import { LoginUser, ValidatedToken } from "../../../models/user.ts";

export const handler = async (
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
  const loginCookie = getLoginCookie(req.headers);
  const loginUser: LoginUser = JSON.parse(atob(loginCookie));

  const validatedToken = await validateGoogleToken(loginUser.accessToken);

  return new Response(JSON.stringify(validatedToken), { status: 200 });
};

const validateGoogleToken = async (
  accessToken: string,
): Promise<ValidatedToken> => {
  const tokenInfoForm = new FormData();
  tokenInfoForm.append("access_token", accessToken);

  const tokenInfoRes = await fetch("https://oauth2.googleapis.com/tokeninfo", {
    method: "POST",
    body: tokenInfoForm,
  });

  if (tokenInfoRes.status >= 400) {
    return { isValid: false };
  }

  const tokenInfo = await tokenInfoRes.json();
  if (!tokenInfo.exp || Date.now() / 1000 > tokenInfo.exp) {
    return { isValid: false };
  }

  return { isValid: true, expire: tokenInfo.exp };
};
