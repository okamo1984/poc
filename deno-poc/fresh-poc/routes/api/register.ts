import { HandlerContext } from "$fresh/server.ts";

export const handler = async (
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
  const body = (await req.body?.getReader().read())?.value;
  if (!body) {
    return new Response(null, { status: 400 });
  }

  const newUser = JSON.parse(new TextDecoder().decode(body));

  return new Response(JSON.stringify(newUser));
};
