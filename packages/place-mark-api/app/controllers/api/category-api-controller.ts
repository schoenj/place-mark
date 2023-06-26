import { ResponseObject } from "@hapi/hapi";
import { Controller, Route } from "../../core/index.js";
import { categoryCreateReadWriteSpec, categoryReadOnlySpec, emptySpec, idParamSpec, paginatedListRequestSpec, validationResultSpec } from "../../schemas/index.js";
import { createResponseSpec, defaultFailAction } from "./utils.js";
import { ICategoryCreateReadWriteDto, IPaginatedListRequest } from "../../core/dtos/index.js";

export class CategoryApiController extends Controller {
  @Route({
    method: "POST",
    path: "/api/category",
    options: {
      auth: { strategy: "jwt" },
      tags: ["api", "category"],
      description: "Creates a new category",
      validate: {
        payload: categoryCreateReadWriteSpec,
        failAction: defaultFailAction,
      },
      response: {
        status: {
          201: categoryReadOnlySpec,
          400: validationResultSpec,
          401: emptySpec,
        },
      },
    },
  })
  public async create$(): Promise<ResponseObject> {
    const createDto = this.request.payload as ICategoryCreateReadWriteDto;
    createDto.createdById = this.user?.id;
    const id = await this.container.categoryRepository.create$(createDto);
    const category = await this.container.categoryRepository.getById$(id);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.h.response(category!).header("Location", `/api/category/${id}`).code(201);
  }

  @Route({
    method: "GET",
    path: "/api/category",
    options: {
      auth: { strategy: "jwt" },
      tags: ["api", "category"],
      description: "Returns a paginated list of categories",
      validate: {
        query: paginatedListRequestSpec,
        failAction: defaultFailAction,
      },
      response: {
        status: {
          200: createResponseSpec(categoryReadOnlySpec),
          400: validationResultSpec,
          401: emptySpec,
        },
        // failAction: logFailAction,
      },
    },
  })
  public async get$(): Promise<ResponseObject> {
    const listRequest = this.request.query as IPaginatedListRequest;
    const result = await this.container.categoryRepository.get$(listRequest);
    return this.h.response(result).code(200);
  }

  @Route({
    method: "GET",
    path: "/api/category/{id}",
    options: {
      auth: { strategy: "jwt" },
      tags: ["api", "category"],
      description: "Returns a category by its id",
      validate: {
        params: idParamSpec,
        failAction: defaultFailAction,
      },
      response: {
        status: {
          200: categoryReadOnlySpec,
          404: emptySpec,
          401: emptySpec,
        },
        // failAction: logFailAction,
      },
    },
  })
  public async getById$(): Promise<ResponseObject> {
    const id = this.request.params.id as string;
    const result = await this.container.categoryRepository.getById$(id);
    if (result) {
      return this.h.response(result).code(200);
    }
    return this.h.response().code(404);
  }
}
