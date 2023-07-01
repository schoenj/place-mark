import { ResponseObject } from "@hapi/hapi";
import { Controller, createForm, createPagedListFormDefinition, Route } from "../core/index.js";
import { pagedListRequestSpec } from "../schemas/paged-list-request-spec.js";
import { createFailAction, pagedToPaginated, paginatedToPaged } from "./utils.js";
import { UserListViewModel } from "../view-models/index.js";
import { IPagedListRequest } from "../core/dtos/index.js";

export class UserController extends Controller {
  @Route({
    method: "GET",
    path: "/user",
    options: {
      auth: { mode: "try", strategy: "session" },
      validate: {
        query: pagedListRequestSpec,
        failAction: async (request) => {
          const result = await request.container.userRepository.get$(pagedToPaginated());
          return createFailAction(createPagedListFormDefinition("/user"), (form) => new UserListViewModel(form, paginatedToPaged(result, request.query)));
        },
      },
    },
  })
  public async get$(): Promise<ResponseObject> {
    const pagedRequest = this.request.query as IPagedListRequest;
    const result = await this.container.userRepository.get$(pagedToPaginated(pagedRequest));

    if (this.user?.admin !== true) {
      result.data.forEach((x) => {
        x.email = "xxx@xxx.de";
      });
    }

    const model = new UserListViewModel(createForm(createPagedListFormDefinition("/user")), paginatedToPaged(result, pagedRequest));
    return this.render(model);
  }
}
