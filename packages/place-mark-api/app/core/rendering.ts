import { Server } from "@hapi/hapi";
import hapiVision from "@hapi/vision";
import Handlebars from "handlebars";

/**
 * Registers Handlebars and integrates with @hapi/vision into a @hapi server
 * @param server The server that should be configured
 * @param relativeTo The path that contains the views-folder
 */
export const registerRenderingEngine$ = async (server: Server, relativeTo: string) => {
  await server.register(hapiVision);
  server.views({
    engines: {
      hbs: Handlebars,
    },
    relativeTo: relativeTo,
    path: "./views",
    layoutPath: "./views/layouts",
    partialsPath: "./views/partials",
    layout: true,
    isCached: false,
  });
};
