import { HandlerContext } from "$fresh/server.ts";
import { deleteLoginCookie, getLoginCookie } from "../../../utils/cookie.ts";
import { HOME_URL } from "../../../utils/constants.ts";

export const handler = (req: Request, _ctx: HandlerContext): Response => {
  const loginCookie = getLoginCookie(req.headers);
  if (loginCookie) {
    deleteLoginCookie(req.headers);
  }
  return Response.redirect(HOME_URL, 307);
};
