import { Server } from "@hapi/hapi";
import hapiVision from "@hapi/vision";
import Handlebars from "handlebars";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";

const insecureHandlebars = allowInsecurePrototypeAccess(Handlebars);

insecureHandlebars.registerHelper("choose", (a, b) => a ?? b);
insecureHandlebars.registerHelper("attribute", (name, value, render = false) => {
  if (render) {
    return new insecureHandlebars.SafeString(`${name}="${value}"`);
  }

  return new insecureHandlebars.SafeString("");
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
      hbs: insecureHandlebars,
    },
    relativeTo: relativeTo,
    path: "./views",
    layoutPath: "./views/layouts",
    partialsPath: "./views/partials",
    layout: true,
    isCached: false,
  });
};
