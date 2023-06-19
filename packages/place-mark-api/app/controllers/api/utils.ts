import Joi, { ValidationError } from "joi";
import { ReqRefDefaults, Request, ResponseObject, ResponseToolkit } from "@hapi/hapi";
import { IPaginatedListResponse, IValidationResult } from "../../core/index.js";

export function createResponseSpec<T>(schema: Joi.ObjectSchema<T>): Joi.ObjectSchema<IPaginatedListResponse<T>> {
  return Joi.object<IPaginatedListResponse<T>>({
    total: Joi.number().min(0).required(),
    data: Joi.array<T>().items(schema),
  });
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
