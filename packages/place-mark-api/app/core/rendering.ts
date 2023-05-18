import { Server } from "@hapi/hapi";
import hapiVision from "@hapi/vision";
import Handlebars from "handlebars";

Handlebars.registerHelper("choose", (a, b) => a ?? b);
Handlebars.registerHelper("attribute", (name, value, render = false) => {
  if (render) {
    return new Handlebars.SafeString(`${name}="${value}"`);
  }

  return new Handlebars.SafeString("");
});

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
