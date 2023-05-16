import { ReqRef, ReqRefDefaults, RouteOptions, ServerRoute } from "@hapi/hapi";

export type EndpointDef = RouteOptions<Partial<Record<keyof ReqRefDefaults, unknown>>>;

export type Route = ServerRoute<ReqRef>;
