import type { FastifyReply, FastifyRequest } from "fastify";
import { getRequestActor } from "./request-context.js";
import type { RequestActor } from "./request-context.js";

export interface AuthenticatedRequestActor extends RequestActor {
  discordId: string;
}

export interface InternalRequestActor extends RequestActor {
  isInternal: true;
}

export function requireAuthenticatedUser(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<AuthenticatedRequestActor | null> {
  return getRequestActor(request).then((actor) => {
    if (!actor.discordId) {
      void reply.code(401).send({
        error: "Authentication required",
      });
      return null;
    }

    return actor as AuthenticatedRequestActor;
  });
}

export function requireAdminAccess(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<RequestActor | null> {
  return getRequestActor(request).then((actor) => {
    if (
      !actor.isInternal &&
      actor.accessLevel !== "mod" &&
      actor.accessLevel !== "admin" &&
      actor.accessLevel !== "full"
    ) {
      void reply.code(403).send({
        error: "Admin access required",
      });
      return null;
    }

    return actor;
  });
}

export function requireFullAccess(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<RequestActor | null> {
  return getRequestActor(request).then((actor) => {
    if (!actor.isInternal && actor.accessLevel !== "full") {
      void reply.code(403).send({
        error: "Full access required",
      });
      return null;
    }

    return actor;
  });
}

export function requireInternalAccess(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<InternalRequestActor | null> {
  return getRequestActor(request).then((actor) => {
    if (!actor.isInternal) {
      void reply.code(403).send({
        error: "Internal API token required",
      });
      return null;
    }

    return actor as InternalRequestActor;
  });
}
