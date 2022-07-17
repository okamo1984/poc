/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import NavigationBar from "../islands/NavigationBar.tsx";
import TokenValidation from "../islands/TokenValidation.tsx";
import { useCSP } from "$fresh/src/runtime/csp.ts";
import {
  HandlerContext,
  Handlers,
  PageProps,
  RouteConfig,
} from "$fresh/server.ts";
import { LoginUser } from "../models/user.ts";
import { State } from "../models/state.ts";
import { CSP_DEFAULT_SRC } from "../utils/constants.ts";

type Home = {
  loginUser?: LoginUser;
};

export const handler: Handlers<Home, State> = {
  GET(req: Request, ctx: HandlerContext<Home, State>) {
    return ctx.render({ loginUser: ctx.state.loginUser });
  },
};

export default function HomePage({ data: { loginUser } }: PageProps<Home>) {
  useCSP((csp) => {
    csp.directives = {
      ...csp.directives,
      defaultSrc: CSP_DEFAULT_SRC,
    };
  });

  return (
    <div>
      <NavigationBar loginUser={loginUser} loginUrl="/api/oauth2/google" />
      {loginUser && (
        <div class={tw`p-4 mx-auto max-w-screen-md top-16 relative`}>
          <TokenValidation />
        </div>
      )}
    </div>
  );
}

export const config: RouteConfig = {
  csp: true,
};
