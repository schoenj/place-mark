import { ResponseObject } from "@hapi/hapi";
import { Controller, createForm, createPagedListFormDefinition, Route } from "../core/index.js";
import { pagedListRequestSpec } from "../schemas/paged-list-request-spec.js";
import { createFailAction, pagedToPaginated, paginatedToPaged } from "./utils.js";
import { UserDetailViewModel, UserListViewModel } from "../view-models/index.js";
import { IPagedListRequest } from "../core/dtos/index.js";
import { idParamSpec } from "../schemas/index.js";

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

    if (!this.admin) {
      result.data.forEach((x) => {
        x.email = x.id === this.user?.id ? x.email : "xxx@xxx.xx";
      });
    }

    const model = new UserListViewModel(createForm(createPagedListFormDefinition("/user")), paginatedToPaged(result, pagedRequest));
    return this.render(model);
  }

  @Route({
    method: "GET",
    path: "/user/{id}",
    options: {
      auth: { mode: "try", strategy: "session" },
      validate: {
        params: idParamSpec,
      },
    },
  })
  public async getById$(): Promise<ResponseObject> {
    const id = this.request.params.id as string;
    const user = await this.container.userRepository.getDetailsById$(id);
    if (user) {
      if (!this.admin || this.user?.id !== id) {
        user.email = "xxx@xxx.xx";
      }

      return this.render(new UserDetailViewModel(user));
    }

    throw Error(); // ToDo!
  }
}
