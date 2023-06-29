import { ResponseObject } from "@hapi/hapi";
import { confirmDeleteSpec, Controller, createForm, createForm$, pagedListFormDefinition, Route } from "../core/index.js";
import { pagedListRequestSpec } from "../schemas/paged-list-request-spec.js";
import { createFailAction, pagedToPaginated, paginatedToPaged } from "./utils.js";
import { PlaceMarkListViewModel } from "../view-models/index.js";
import { IConfirmDeleteRequest, IPagedListRequest, IPlaceMarkCreateReadWriteDto } from "../core/dtos/index.js";
import { idParamSpec, placeMarkCreateReadWriteSpec } from "../schemas/index.js";
import { ConfirmDeleteViewModel } from "../view-models/general/confirm-delete-view-model.js";
import { placeMarkCreateFormDefinition } from "../core/form/definitions/place-mark-create-form-definition.js";
import { PlaceMarkCreateViewModel } from "../view-models/place-mark/place-mark-create-view-model.js";

export class PlaceMarkController extends Controller {
  @Route({
    method: "GET",
    path: "/place-mark/new",
    options: {
      auth: { strategy: "session" },
    },
  })
  public async showCreate$(): Promise<ResponseObject> {
    const form = await createForm$(placeMarkCreateFormDefinition, this.container);
    return this.render(new PlaceMarkCreateViewModel(form));
  }

  @Route({
    method: "POST",
    path: "/place-mark",
    options: {
      auth: { strategy: "session" },
      validate: {
        payload: placeMarkCreateReadWriteSpec,
        // failAction: ,
      },
    },
  })
  public async create$(): Promise<ResponseObject> {
    const category = this.request.payload as IPlaceMarkCreateReadWriteDto;
    category.createdById = this.user?.id;
    const id = await this.container.placeMarkRepository.create$(category);
    return this.h.redirect(`/place-mark/${id}`);
  }

  @Route({
    method: "GET",
    path: "/place-mark",
    options: {
      auth: { strategy: "session" },
      validate: {
        query: pagedListRequestSpec,
        failAction: async (request) => {
          const result = await request.container.placeMarkRepository.get$(pagedToPaginated());
          return createFailAction(pagedListFormDefinition, (form) => new PlaceMarkListViewModel(form, paginatedToPaged(result, request.query)));
        },
      },
    },
  })
  public async get$(): Promise<ResponseObject> {
    const pagedRequest = this.request.query as IPagedListRequest;
    const result = await this.container.placeMarkRepository.get$(pagedToPaginated(pagedRequest));
    const model = new PlaceMarkListViewModel(createForm(pagedListFormDefinition), paginatedToPaged(result, pagedRequest));
    return this.render(model);
  }

  @Route({
    method: "GET",
    path: "/place-mark/{id}/delete",
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
    const entity = await this.container.placeMarkRepository.getById$(id);

    if (!entity) {
      throw new Error();
    }

    const model = new ConfirmDeleteViewModel(id, entity.designation, `/place-mark/${id}/delete`);
    return this.render(model);
  }

  @Route({
    method: "POST",
    path: "/place-mark/{id}/delete",
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
      return this.h.redirect(`/place-mark/${id}/delete`);
    }

    await this.container.placeMarkRepository.deleteById$(id);
    return this.h.redirect("/place-mark");
  }
}
