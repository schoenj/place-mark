import { ResponseObject } from "@hapi/hapi";
import { categoryCreateFormDefinition, confirmDeleteSpec, Controller, createForm, pagedListFormDefinition, Route } from "../core/index.js";
import { ConfirmDeleteViewModel } from "../view-models/general/confirm-delete-view-model.js";
import { categoryCreateReadWriteSpec, idParamSpec } from "../schemas/index.js";
import { ICategoryCreateReadWriteDto, IConfirmDeleteRequest, IPagedListRequest } from "../core/dtos/index.js";
import { pagedListRequestSpec } from "../schemas/paged-list-request-spec.js";
import { createFailAction, pagedToPaginated, paginatedToPaged } from "./utils.js";
import { CategoryCreateViewModel, CategoryListViewModel } from "../view-models/index.js";

export class CategoryController extends Controller {
  @Route({
    method: "GET",
    path: "/category/new",
    options: {
      auth: { strategy: "session" },
    },
  })
  public showCreate(): ResponseObject {
    return this.render(new CategoryCreateViewModel(createForm(categoryCreateFormDefinition)));
  }

  @Route({
    method: "POST",
    path: "/category",
    options: {
      auth: { strategy: "session" },
      validate: {
        payload: categoryCreateReadWriteSpec,
        failAction: createFailAction(categoryCreateFormDefinition, (form) => new CategoryCreateViewModel(form)),
      },
    },
  })
  public async create$(): Promise<ResponseObject> {
    const category = this.request.payload as ICategoryCreateReadWriteDto;
    category.createdById = this.user?.id;
    const id = await this.container.categoryRepository.create$(category);
    return this.h.redirect(`/category/${id}`);
  }

  @Route({
    method: "GET",
    path: "/category",
    options: {
      auth: { strategy: "session" },
      validate: {
        query: pagedListRequestSpec,
        failAction: async (request) => {
          const result = await request.container.categoryRepository.get$(pagedToPaginated());
          return createFailAction(pagedListFormDefinition, (form) => new CategoryListViewModel(form, paginatedToPaged(result, request.query)));
        },
      },
    },
  })
  public async get$(): Promise<ResponseObject> {
    const pagedRequest = this.request.query as IPagedListRequest;
    const result = await this.container.categoryRepository.get$(pagedToPaginated(pagedRequest));
    const model = new CategoryListViewModel(createForm(pagedListFormDefinition), paginatedToPaged(result, pagedRequest));
    return this.render(model);
  }

  @Route({
    method: "GET",
    path: "/category/{id}/delete",
    options: {
      auth: { strategy: "session" },
      // validate: {
      //   params: idParamSpec,
      //   failAction: createFailAction()
      // },
    },
  })
  public async showDelete$(): Promise<ResponseObject> {
    const id = this.request.params.id as string;
    const entity = await this.container.categoryRepository.getById$(id);

    if (!entity) {
      throw new Error();
    }

    const model = new ConfirmDeleteViewModel(id, entity.designation, `/category/${id}/delete`);
    return this.render(model);
  }

  @Route({
    method: "POST",
    path: "/category/{id}/delete",
    options: {
      auth: { strategy: "session" },
      validate: {
        params: idParamSpec,
        payload: confirmDeleteSpec,
      },
    },
  })
  public async delete$(): Promise<ResponseObject> {
    const id = this.request.params.id as string;
    const { confirm } = this.request.payload as IConfirmDeleteRequest;
    if (confirm !== "confirmed") {
      return this.h.redirect(`/category/${id}/delete`);
    }

    await this.container.categoryRepository.deleteById$(id);
    return this.h.redirect("/category");
  }
}
