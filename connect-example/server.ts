import { fastifyConnectPlugin } from "@bufbuild/connect-fastify";
import fastify from "fastify";
import fastifyCors from "@fastify/cors";

import { routes } from "./connect.js";
import { cors } from "@bufbuild/connect";

async function main() {
    const server = fastify();
    await server.register(fastifyConnectPlugin, {
        routes,
    });
    await server.register(fastifyCors, {
        origin: true,
        methods: [...cors.allowedMethods],
        allowedHeaders: [...cors.allowedHeaders],
        exposedHeaders: [...cors.exposedHeaders],
        maxAge: 2 * 60 * 60,
    });
    server.get("/", (_, reply) => {
        reply.type("text/plain");
        reply.send("Hello World!");
    });
    await server.listen({ host: "localhost", port: 8080 });
    console.log("server is listening at", server.addresses());
}

main();
