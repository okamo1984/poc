import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import resolvers from "./resolvers"
import createYogaServer from "./server"

import "graphql-import-node"
import typeDefs from "../../../schema.graphql"

createYogaServer({ typeDefs, resolvers }).start()
