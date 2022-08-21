import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { Server } from "node:http"
import createYogaServer from "@solid-gql/gql-server/src/server"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { addMocksToSchema } from "@graphql-tools/mock"
import { TestContext, beforeEach, beforeAll, afterAll } from "vitest"

const schemaFilePath = resolve(__dirname, "..", "..", "schema.graphql")
const typeDefs = readFileSync(schemaFilePath, "utf8")

// Make a GraphQL schema with no resolvers
const schema = makeExecutableSchema({ typeDefs })

// Create a new schema with mocks
const schemaWithMocks = addMocksToSchema({ schema })

export let yoga: Server

beforeAll(async () => {
  yoga = await createYogaServer(schemaWithMocks).start()
})

afterAll(() => {
  yoga.close()
})
