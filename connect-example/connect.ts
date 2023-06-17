import { ConnectRouter } from "@bufbuild/connect";
import { ElizaService } from "./gen/eliza_connect.js";

export const routes = (router: ConnectRouter) =>
    router.service(ElizaService, {
        async say(req) {
            return {
                sentence: `You said: ${req.sentence}`,
            };
        },
    });
