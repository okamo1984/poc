import { createServer } from "@graphql-yoga/node"
import { useAuth0 } from "@envelop/auth0"

import { renderGraphiQL } from "@graphql-yoga/render-graphiql"
import { useValidationCache } from "@envelop/validation-cache"
import { useResponseCache } from "@envelop/response-cache"

const createYogaServer = (schema) =>
  createServer({
    hostname: "localhost",
    port: 4000,
    endpoint: "/api/graphql",
    schema,
    renderGraphiQL,
    plugins: [
      useAuth0({
        domain: process.env.AUTH0_DOMAIN,
        audience: process.env.AUTH0_AUDIENCE,
        headerName: "authorization",
        preventUnauthenticatedAccess: false,
        extendContextField: "auth0",
        tokenType: "Bearer",
        onError: (e) => {
          console.warn(e)
        },
      }),
      useValidationCache(),
      useResponseCache({
        session: () => null,
      }),
    ],
  })

export default createYogaServer
