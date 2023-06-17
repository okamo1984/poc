import { createRouterTransport } from "@bufbuild/connect"
import { BigIntService } from "./gen/count_connect.js"
import { CountResponse } from "./gen/count_pb.js"

export const mockBigIntTransport = () =>
    createRouterTransport(({ service }) => {
        service(BigIntService, {
            count: () => new CountResponse({ count: 1n })
        })
    })