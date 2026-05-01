import "fastify";
import type { BackendEnv } from "@kova/config";

declare module "fastify" {
  interface FastifyInstance {
    appEnv: BackendEnv;
  }
}

