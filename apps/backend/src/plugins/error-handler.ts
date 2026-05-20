import { Prisma } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { AppError } from "../errors.js";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        error: error.message,
        code: error.code,
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return reply.code(404).send({
          error: "Requested resource was not found",
          code: "not_found",
        });
      }

      if (error.code === "P2002") {
        return reply.code(409).send({
          error: "A resource with these unique fields already exists",
          code: "unique_constraint",
        });
      }
    }

    request.log.error({ err: error }, "Unhandled backend error");

    return reply.code(500).send({
      error: "Internal server error",
      code: "internal_error",
    });
  });
}
