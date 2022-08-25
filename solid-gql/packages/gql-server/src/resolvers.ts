import { Resolvers } from "./graphql"

const resolvers: Resolvers = {
  Query: {
    posts: (parent, args, context, info) => {
      console.info(context.auth0)
      return []
    },
  },
}

export default resolvers
