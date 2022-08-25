import { Resolvers } from "./graphql"

const resolvers: Resolvers = {
  Query: {
    posts: (parent, args, context, info) => {
      console.info(context.auth0)
      return Promise.resolve([])
    },
  },
}

export default resolvers
