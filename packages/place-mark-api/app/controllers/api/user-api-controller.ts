import Joi from "joi";
import { ResponseObject } from "@hapi/hapi";
import { Controller, IPaginatedListRequest, IUserReadOnlyDto, Route, IValidationResult } from "../../core/index.js";
import { createResponseSpec, defaultFailAction } from "./utils.js";

const paginatedListRequestSpec: Joi.ObjectSchema<IPaginatedListRequest> = Joi.object<IPaginatedListRequest>({
  take: Joi.number().min(1).max(100).optional(),
  skip: Joi.number().min(0).optional(),
});

const userReadOnlySpec: Joi.ObjectSchema<IUserReadOnlyDto> = Joi.object<IUserReadOnlyDto>({
  id: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  admin: Joi.boolean().required(),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
});

const validationResultSpec: Joi.ObjectSchema<IValidationResult> = Joi.object({
  property: Joi.string(),
  message: Joi.string(),
});

const idSpec = Joi.alternatives().try(Joi.string(), Joi.object()).description("a valid ID");

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
        params: { id: idSpec },
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

  @Route({
    method: "DELETE",
    path: "/api/user/{id}",
    options: {
      auth: false, // ToDo
      tags: ["api"],
      description: "Deletes an user by its id",
      validate: {
        params: { id: idSpec },
        failAction: defaultFailAction,
      },
    },
  })
  public async deleteById$(): Promise<ResponseObject> {
    const id = this.request.params.id as string;
    await this.request.container.userRepository.deleteById$(id);
    return this.response.response().code(204);
  }
}
