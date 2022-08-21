import { describe, it, expect } from "vitest"
import request from "supertest"
import { yoga } from "./setup"

describe("posts", () => {
  it("query", async () => {
    const response = await request(yoga)
      .post("/api/graphql")
      .send({
        query: `{   posts {
        id
        title
        author {
          id
          firstName
          lastName
        }
      } }`,
      })

    expect(response.status).equal(200)
  })
})
