import { createServer } from "@graphql-yoga/node"

import { renderGraphiQL } from "@graphql-yoga/render-graphiql"

const createYogaServer = (schema) =>
  createServer({
    hostname: "localhost",
    port: 4000,
    endpoint: "/api/graphql",
    schema,
    renderGraphiQL,
  })

export default createYogaServer
