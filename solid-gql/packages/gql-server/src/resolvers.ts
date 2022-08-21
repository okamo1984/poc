import { Resolvers } from "./graphql"

const resolvers: Resolvers = {
  Query: {
    posts: (parent, args, context, info) => {
      return []
    },
  },
}

export default resolvers
