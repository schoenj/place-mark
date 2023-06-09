import { ResponseObject } from "@hapi/hapi";
import { Controller, IValidationResult, Route } from "../../core/index.js";
import {
  categoryCreateReadWriteSpec,
  categoryDetailsSpec,
  categoryReadOnlySpec,
  categoryReadWriteSpec,
  emptySpec,
  idParamSpec,
  paginatedListRequestSpec,
  validationResultSpec,
} from "../../schemas/index.js";
import { createResponseSpec, defaultFailAction } from "./utils.js";
import { ICategoryCreateReadWriteDto, ICategoryReadOnlyDto, ICategoryReadWriteDto, IPaginatedListRequest } from "../../core/dtos/index.js";
import { BusinessException } from "../../core/business-exception.js";

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
          201: categoryDetailsSpec,
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
          200: categoryDetailsSpec,
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

  @Route({
    method: "PUT",
    path: "/api/category",
    options: {
      auth: { strategy: "jwt" },
      tags: ["api", "category"],
      description: "Updates a category",
      validate: {
        payload: categoryReadWriteSpec,
        failAction: defaultFailAction,
      },
      response: {
        status: {
          200: categoryDetailsSpec,
          404: emptySpec,
          401: emptySpec,
        },
      },
    },
  })
  public async updateById$(): Promise<ResponseObject> {
    const category = this.request.payload as ICategoryReadWriteDto;
    try {
      await this.container.categoryRepository.update$(category);
    } catch (ex) {
      if (ex instanceof BusinessException) {
        return this.h.response().code(404);
      }

      throw ex;
    }
    const result = await this.container.categoryRepository.getById$(category.id);
    return this.h.response(result as ICategoryReadOnlyDto);
  }

  @Route({
    method: "DELETE",
    path: "/api/category/{id}",
    options: {
      auth: { strategy: "jwt" },
      tags: ["api", "category"],
      description: "Deletes a category by its id",
      validate: {
        params: idParamSpec,
        failAction: defaultFailAction,
      },
      response: {
        status: {
          204: emptySpec,
          400: validationResultSpec,
          401: emptySpec,
        },
      },
    },
  })
  public async deleteById$(): Promise<ResponseObject> {
    const id = this.request.params.id as string;
    try {
      await this.container.categoryRepository.deleteById$(id);
    } catch (e) {
      if (e instanceof BusinessException) {
        return this.h
          .response([
            {
              property: "id",
              message: e.message,
            },
          ] as IValidationResult[])
          .code(400);
      }

      throw e;
    }
    return this.h.response().code(204);
  }
}
