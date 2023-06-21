import { ResponseObject } from "@hapi/hapi";
import { Controller, IPaginatedListRequest, Route } from "../../core/index.js";
import { createResponseSpec, defaultFailAction } from "./utils.js";
import { emptySpec, idParamSpec, paginatedListRequestSpec, userReadOnlySpec, validationResultSpec } from "../../schemas/index.js";

export class UserApiController extends Controller {
  @Route({
    method: "GET",
    path: "/api/user",
    options: {
      auth: { strategy: "jwt" },
      tags: ["api", "user"],
      description: "Returns a paginated list of users",
      validate: {
        query: paginatedListRequestSpec,
        failAction: defaultFailAction,
      },
      response: {
        status: {
          200: createResponseSpec(userReadOnlySpec),
          400: validationResultSpec,
          401: emptySpec,
        },
        // failAction: logFailAction,
      },
    },
  })
  public async get$(): Promise<ResponseObject> {
    const listRequest = this.request.query as IPaginatedListRequest;
    const result = await this.container.userRepository.get$(listRequest);
    return this.h.response(result).code(200);
  }

  @Route({
    method: "GET",
    path: "/api/user/{id}",
    options: {
      auth: { strategy: "jwt" },
      tags: ["api", "user"],
      description: "Returns a user by its id",
      validate: {
        params: idParamSpec,
        failAction: defaultFailAction,
      },
      response: {
        status: {
          200: userReadOnlySpec,
          404: emptySpec,
          401: emptySpec,
        },
        // failAction: logFailAction,
      },
    },
  })
  public async getById$(): Promise<ResponseObject> {
    const id = this.request.params.id as string;
    const result = await this.container.userRepository.getById$(id);
    if (result) {
      return this.h.response(result).code(200);
    }
    return this.h.response().code(404);
  }

  @Route({
    method: "DELETE",
    path: "/api/user/{id}",
    options: {
      auth: { strategy: "jwt" },
      tags: ["api", "user"],
      description: "Deletes an user by its id",
      validate: {
        params: idParamSpec,
        failAction: defaultFailAction,
      },
      response: {
        status: {
          204: emptySpec,
          401: emptySpec,
        },
      },
    },
  })
  public async deleteById$(): Promise<ResponseObject> {
    const id = this.request.params.id as string;
    await this.container.userRepository.deleteById$(id);
    return this.h.response().code(204);
  }
}
