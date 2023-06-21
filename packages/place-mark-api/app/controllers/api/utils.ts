import Joi, { ValidationError } from "joi";
import { ReqRefDefaults, Request, ResponseObject, ResponseToolkit } from "@hapi/hapi";
import { IPaginatedListResponse, IValidationResult } from "../../core/index.js";

export function createResponseSpec<T>(schema: Joi.ObjectSchema<T>): Joi.ObjectSchema<IPaginatedListResponse<T>> {
  const joiDescription = schema.describe();
  const itemLabel = typeof joiDescription.flags === "object" && "label" in joiDescription.flags ? (joiDescription.flags.label as string) : null;

  if (itemLabel === null) {
    throw new Error("Label of children schema is not set.");
  }

  return Joi.object<IPaginatedListResponse<T>>({
    total: Joi.number().min(0).required(),
    data: Joi.array().items(schema).label(`${itemLabel}Array`),
  }).label(`PaginatedListRequestDto<${itemLabel}>`);
}

export function defaultFailAction(request: Request<ReqRefDefaults>, h: ResponseToolkit<ReqRefDefaults>, err: Error | undefined): ResponseObject {
  return h
    .response((err as ValidationError).details.map((x) => ({ property: x.path.join("."), message: x.message } as IValidationResult)))
    .code(400)
    .takeover();
}

export function logFailAction(request: Request<ReqRefDefaults>, h: ResponseToolkit<ReqRefDefaults>, err: Error | undefined) {
  console.log(err?.message);
  return h;
}
