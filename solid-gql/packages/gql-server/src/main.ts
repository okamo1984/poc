import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import resolvers from "./resolvers"
import createYogaServer from "./server"

const schemaFilePath = resolve(__dirname, "..", "..", "..", "schema.graphql")
const typeDefs = readFileSync(schemaFilePath, "utf8")

createYogaServer({ typeDefs, resolvers }).start()
