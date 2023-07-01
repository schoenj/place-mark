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

insecureHandlebars.registerHelper("forEach", (from: number, to: number, options) => {
  let output = "";
  // eslint-disable-next-line no-plusplus
  for (; from <= to; from++) {
    output += options.fn(from);
  }
  return new insecureHandlebars.SafeString(output);
});

insecureHandlebars.registerHelper("or", (value1, value2) => value1 || value2);
insecureHandlebars.registerHelper("not", (value1) => !value1);

insecureHandlebars.registerHelper("isEqual", (value1, value2) => value1 === value2);

insecureHandlebars.registerHelper("dateFormat", (value: Date) => new insecureHandlebars.SafeString(`${value.toLocaleDateString()} ${value.toLocaleTimeString()}`));

function escape<T>(data: T): T {
  if (data === undefined || data === null) {
    return data;
  }

  if (typeof data === "string") {
    let newStr = data as string;
    // eslint-disable-next-line quotes
    while (newStr.includes('"')) {
      // eslint-disable-next-line quotes
      newStr = newStr.replace('"', "&quot;");
    }

    return newStr as T;
  }

  if (Array.isArray(data)) {
    const newData = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const el of data) {
      newData.push(escape(el));
    }
    return newData as T;
  }

  if (typeof data === "object") {
    const newData: { [key: string]: unknown } = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(data)) {
      newData[key] = escape((data as { [key: string]: unknown })[key]);
    }
    return newData as T;
  }

  return data;
}

insecureHandlebars.registerHelper("json", (value) => new insecureHandlebars.SafeString(JSON.stringify(escape(value))));

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
