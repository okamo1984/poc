import { readFileSync } from "node:fs"
import { createServer } from "@graphql-yoga/node"
import { Resolvers } from "./graphql"
import { renderGraphiQL } from "@graphql-yoga/render-graphiql"

const typeDefs = readFileSync("./schema.graphql", "utf8")

const resolvers: Resolvers = {
  Query: {
    posts: (parent, args, context, info) => {
      return []
    },
  },
}

const server = createServer({
  hostname: "localhost",
  port: 4000,
  endpoint: "/api/graphql",
  schema: {
    typeDefs,
    resolvers,
  },
  renderGraphiQL,
})

export default server
