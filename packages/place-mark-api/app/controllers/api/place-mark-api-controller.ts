import { ResponseObject } from "@hapi/hapi";
import { Controller, Route } from "../../core/index.js";
import {
  emptySpec,
  idParamSpec,
  paginatedListRequestSpec,
  placeMarkCreateReadWriteSpec,
  placeMarkReadOnlySpec, placeMarkReadWriteSpec,
  validationResultSpec
} from "../../schemas/index.js";
import { createResponseSpec, defaultFailAction } from "./utils.js";
import {
  IPaginatedListRequest,
  IPlaceMarkCreateReadWriteDto,
  IPlaceMarkReadOnlyDto,
  IPlaceMarkReadWriteDto
} from "../../core/dtos/index.js";
import {BusinessException} from "../../core/business-exception.js";

export class PlaceMarkApiController extends Controller {
  @Route({
    method: "POST",
    path: "/api/place-mark",
    options: {
      auth: { strategy: "jwt" },
      tags: ["api", "place-mark"],
      description: "Saves a place-mark",
      validate: {
        payload: placeMarkCreateReadWriteSpec,
        failAction: defaultFailAction,
      },
      response: {
        status: {
          201: placeMarkReadOnlySpec,
          400: validationResultSpec,
          401: emptySpec,
        },
      },
    },
  })
  async create$(): Promise<ResponseObject> {
    const createDto = this.request.payload as IPlaceMarkCreateReadWriteDto;
    createDto.createdById = this.user?.id;
    const id = await this.container.placeMarkRepository.create$(createDto);
    const placeMark = await this.container.placeMarkRepository.getById$(id);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.h.response(placeMark!).header("Location", `/api/place-mark/${id}`).code(201);
  }

  @Route({
    method: "GET",
    path: "/api/place-mark",
    options: {
      auth: { strategy: "jwt" },
      tags: ["api", "place-mark"],
      description: "Returns a paginated list of place-marks",
      validate: {
        query: paginatedListRequestSpec,
        failAction: defaultFailAction,
      },
      response: {
        status: {
          200: createResponseSpec(placeMarkReadOnlySpec),
          400: validationResultSpec,
          401: emptySpec,
        },
      },
    },
  })
  public async get$(): Promise<ResponseObject> {
    const listRequest = this.request.query as IPaginatedListRequest;
    const result = await this.container.placeMarkRepository.get$(listRequest);
    return this.h.response(result).code(200);
  }

  @Route({
    method: "GET",
    path: "/api/place-mark/{id}",
    options: {
      auth: { strategy: "jwt" },
      tags: ["api", "place-mark"],
      description: "Returns a place-mark by its id",
      validate: {
        params: idParamSpec,
        failAction: defaultFailAction,
      },
      response: {
        status: {
          200: placeMarkReadOnlySpec,
          404: emptySpec,
          401: emptySpec,
        },
        // failAction: logFailAction,
      },
    },
  })
  public async getById$(): Promise<ResponseObject> {
    const id = this.request.params.id as string;
    const result = await this.container.placeMarkRepository.getById$(id);
    if (result) {
      return this.h.response(result).code(200);
    }
    return this.h.response().code(404);
  }

  @Route({
    method: "PUT",
    path: "/api/place-mark",
    options: {
      auth: { strategy: "jwt" },
      tags: ["api", "place-mark"],
      description: "Updates a place-mark",
      validate: {
        payload: placeMarkReadWriteSpec,
        failAction: defaultFailAction
      },
      response: {
        status: {
          200: placeMarkReadOnlySpec,
          404: emptySpec,
          401: emptySpec
        }
      }
    }
  })
  public async updateById$(): Promise<ResponseObject> {
    const placeMark = this.request.payload as IPlaceMarkReadWriteDto;
    try {
      await this.container.placeMarkRepository.update$(placeMark);
    } catch(ex) {
      if (ex instanceof BusinessException) {
        return this.h.response().code(404);
      }

      throw ex;
    }
    const result = await this.container.placeMarkRepository.getById$(placeMark.id);
    return this.h.response(result as IPlaceMarkReadOnlyDto);
  }

  @Route({
    method: "DELETE",
    path: "/api/place-mark/{id}",
    options: {
      auth: { strategy: "jwt" },
      tags: ["api", "place-mark"],
      description: "Deletes a place-mark by its id",
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
    }
  })
  public async deleteById$(): Promise<ResponseObject> {
    const id = this.request.params.id as string;
    await this.container.placeMarkRepository.deleteById$(id);
    return this.h.response().code(204);
  }
}
