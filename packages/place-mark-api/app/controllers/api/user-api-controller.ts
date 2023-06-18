import Joi, { ValidationError } from "joi";
import { ReqRefDefaults, Request, ResponseObject, ResponseToolkit } from "@hapi/hapi";
import { Controller, IPaginatedListRequest, IPaginatedListResponse, IUserReadOnlyDto, Route } from "../../core/index.js";

const paginatedListRequestSpec: Joi.ObjectSchema<IPaginatedListRequest> = Joi.object<IPaginatedListRequest>({
  take: Joi.number().min(1).max(100).optional(),
  skip: Joi.number().min(0).optional(),
});

function createResponseSpec<T>(schema: Joi.ObjectSchema<T>): Joi.ObjectSchema<IPaginatedListResponse<T>> {
  return Joi.object<IPaginatedListResponse<T>>({
    total: Joi.number().min(0).required(),
    data: Joi.array<T>().items(schema),
  });
}

const userReadOnlySpec: Joi.ObjectSchema<IUserReadOnlyDto> = Joi.object<IUserReadOnlyDto>({
  id: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  admin: Joi.boolean().required(),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
});

export interface IValidationResult {
  property: string;
  message: string;
}

const validationResultSpec: Joi.ObjectSchema<IValidationResult> = Joi.object({
  property: Joi.string(),
  message: Joi.string(),
});

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

export class UserApiController extends Controller {
  @Route({
    method: "GET",
    path: "/api/user",
    options: {
      auth: false, // ToDo: Setup Bearer Authentication
      tags: ["api"],
      description: "Returns a paginated list of users",
      validate: {
        query: paginatedListRequestSpec,
        failAction: defaultFailAction,
      },
      response: {
        status: {
          200: createResponseSpec(userReadOnlySpec),
          400: Joi.array().items(validationResultSpec),
        },
        // failAction: logFailAction,
      },
    },
  })
  public async get$(): Promise<ResponseObject> {
    const listRequest = this.request.query as IPaginatedListRequest;
    const result = await this.request.container.userRepository.get$(listRequest);
    return this.response.response(result).code(200);
  }

  @Route({
    method: "GET",
    path: "/api/user/{id}",
    options: {
      auth: false, // ToDo
      tags: ["api"],
      description: "Returns a user by its id",
      validate: {
        params: { id: Joi.string() },
        failAction: defaultFailAction,
      },
      response: {
        status: {
          200: userReadOnlySpec,
        },
        // failAction: logFailAction,
      },
    },
  })
  public async getById$(): Promise<ResponseObject> {
    const id = this.request.params.id as string;
    const result = await this.request.container.userRepository.getById$(id);
    if (result) {
      return this.response.response(result).code(200);
    }
    return this.response.response().code(404);
  }
}
