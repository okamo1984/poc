import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getLoginCookie } from "../utils/cookie.ts";
import { State } from "../models/state.ts";

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  const loginCookie = getLoginCookie(req.headers);
  if (loginCookie) {
    ctx.state.loginUser = JSON.parse(atob(loginCookie));
  }
  const resp = await ctx.next();
  return resp;
}
