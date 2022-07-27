const port = 8080;
const issuer = "https://account-d.docusign.com/oauth/auth";
const tokenUri = "https://account-d.docusign.com/oauth/token";
const userUri = "https://account-d.docusign.com/oauth/userinfo";
const integrationKey = Deno.env.get("DOCUSIGN_INTEGRATION_KEY") || "";
const secretKey = Deno.env.get("DOCUSIGN_SECRET_KEY") || "";
const state = "state";
let userInfo: User & Token;

const render = (v: User & Token | Account | Account[]): string => {
  if (Array.isArray(v)) {
    return v.map((vv, i) => `<div>No.${i}${render(vv)}</div>`).join("");
  }
  if (typeof v === "object") {
    return Object.entries(v).map((entry) =>
      `<div>${entry[0]}: ${render(entry[1])}</div>`
    ).join("");
  }
  return `<span>${v}</span>`;
};
const successHtml = (userInfo: User & Token) => `
<html>
    <head>
        <title>DocuSign Login Success</title>
        <meta charset="UTF-8" />
    </head>
    <body>
        <h1>DocuSignのログイン成功後に表示する画面</h1>
        <h2>ユーザの情報</h2>
        <div>
         ${render(userInfo)}
        </div>
    </body>
</html>
`;

const createDocuSignOAuth2URL = (): string => {
  const url = new URL(issuer);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("scope", "signature");
  url.searchParams.append("client_id", integrationKey);
  url.searchParams.append("state", state);
  url.searchParams.append("redirect_uri", "http://localhost:8080/callback");
  return url.toString();
};

type Token = {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
};

type User = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  created: string;
  email: string;
  accounts: Account[];
};

type Account = {
  account_id: string;
  is_default: boolean;
  account_name: string;
  base_uri: string;
};

const handleHttp = async (conn: Deno.Conn) => {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
    const request = requestEvent.request;
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === "/") {
      try {
        const content = await Deno.readFile("index.html");
        const decoder = new TextDecoder("utf-8");
        await requestEvent.respondWith(
          new Response(decoder.decode(content), {
            status: 200,
            headers: { "Content-Type": "text/html" },
          }),
        );
      } catch (e) {
        console.error(e);
        await requestEvent.respondWith(
          new Response("index.html cannot be read", { status: 500 }),
        );
        return;
      }
    } else if (pathname === "/success") {
      await requestEvent.respondWith(
        new Response(
          successHtml(userInfo),
          { status: 200, headers: { "Content-Type": "text/html" } },
        ),
      );
    } else if (pathname === "/login") {
      await requestEvent.respondWith(
        Response.redirect(createDocuSignOAuth2URL(), 302),
      );
    } else if (pathname !== "/callback") {
      await requestEvent.respondWith(
        new Response("Invalid pathname", { status: 400 }),
      );
    } else {
      const code = url.searchParams.get("code");
      if (!code) {
        await requestEvent.respondWith(
          new Response("Invalid code", { status: 400 }),
        );
      }

      const data = new FormData();
      data.append("grant_type", "authorization_code");
      data.append("code", code!);

      const tokenRes = await fetch(tokenUri, {
        body: data,
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(integrationKey + ":" + secretKey)}`,
        },
      });
      const token: Token = await tokenRes.json();

      const userRes = await fetch(userUri, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token.access_token}`,
        },
      });
      const user = await userRes.json();
      userInfo = { ...token, ...user };
      await requestEvent.respondWith(
        Response.redirect(`${url.origin}/success`, 302),
      );
    }
  }
};

console.log(`HTTP webserver running. Access it at: http://localhost:${port}/`);

const server = Deno.listen({ port });
for await (const conn of server) {
  handleHttp(conn).catch(console.error);
}
