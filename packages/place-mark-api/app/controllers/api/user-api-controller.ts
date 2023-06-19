import Joi from "joi";
import { ResponseObject } from "@hapi/hapi";
import { Controller, IPaginatedListRequest, IUserReadOnlyDto, Route, IValidationResult } from "../../core/index.js";
import { createResponseSpec, defaultFailAction } from "./utils.js";

const paginatedListRequestSpec: Joi.ObjectSchema<IPaginatedListRequest> = Joi.object<IPaginatedListRequest>({
  take: Joi.number().min(1).max(100).optional().description("The amount of entries to fetch."),
  skip: Joi.number().min(0).optional().description("The amount of entries to skip"),
})
  .label("PaginatedListRequestDto")
  .description("Implements properties for requesting a paginated list");

const idSpec = Joi.string().required().label("ID").description("a valid ID");

const userReadOnlySpec: Joi.ObjectSchema<IUserReadOnlyDto> = Joi.object<IUserReadOnlyDto>({
  id: idSpec,
  firstName: Joi.string().required().description("First name of a user"),
  lastName: Joi.string().required().description("Last name of a user"),
  email: Joi.string().email().required().description("Email of a user"),
  admin: Joi.boolean().required().description("Value indicating whether a user is an admin"),
  createdAt: Joi.date().required().description("The entry creation time"),
  updatedAt: Joi.date().required().description("The last entry modification time"),
}).label("UserReadOnlyDto");

const validationResultItemSpec: Joi.ObjectSchema<IValidationResult> = Joi.object({
  property: Joi.string().required().description("The path to an invalid property."),
  message: Joi.string().required().description("A description of the rule that were not matched."),
}).label("ValidationResultItem");

const validationResultSpec: Joi.ArraySchema<IValidationResult[]> = Joi.array().items(validationResultItemSpec).label("ValidationResult");

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
          400: validationResultSpec,
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
          404: Joi.any(),
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
        params: Joi.object({ id: idSpec }),
        failAction: defaultFailAction,
      },
      response: {
        status: {
          204: Joi.any(),
        },
      },
    },
  })
  public async deleteById$(): Promise<ResponseObject> {
    const id = this.request.params.id as string;
    await this.request.container.userRepository.deleteById$(id);
    return this.response.response().code(204);
  }
}
