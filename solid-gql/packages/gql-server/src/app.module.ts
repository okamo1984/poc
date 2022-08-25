import { Module } from "@nestjs/common"
import { YogaDriver, YogaDriverConfig } from "@graphql-yoga/nestjs"
import { GraphQLModule } from "@nestjs/graphql"
import { PostsModule } from "./posts/posts.module"
import { useAuth0 } from "@envelop/auth0"
import { useValidationCache } from "@envelop/validation-cache"
import { useResponseCache } from "@envelop/response-cache"
import { useGraphQlJit } from "@envelop/graphql-jit"

@Module({
  imports: [
    PostsModule,
    GraphQLModule.forRoot<YogaDriverConfig>({
      driver: YogaDriver,
      typePaths: ["./**/*.graphql"],
      installSubscriptionHandlers: true,
      // plugins: [
      //   useAuth0({
      //     domain: process.env.AUTH0_DOMAIN,
      //     audience: process.env.AUTH0_AUDIENCE,
      //     headerName: "authorization",
      //     preventUnauthenticatedAccess: false,
      //     extendContextField: "auth0",
      //     tokenType: "Bearer",
      //     onError: (e) => {
      //       console.warn(e)
      //     },
      //   }),
      //   useValidationCache(),
      //   useResponseCache({
      //     session: () => null,
      //   }),
      //   useGraphQlJit({ customJSONSerializer: true }),
      // ],
    }),
  ],
})
export class AppModule {}
