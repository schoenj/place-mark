import { Lifecycle, ReqRefDefaults, Request, ResponseToolkit } from "@hapi/hapi";
import { ValidationError } from "joi";
import { ViewModel } from "../view-models/base/view-model.js";
import { createFailedForm, FormDefinition, IForm } from "../core/index.js";
import FailAction = Lifecycle.FailAction;
import { IPagedListRequest, IPagedListResponse, IPaginatedListRequest, IPaginatedListResponse } from "../core/dtos/index.js";

export function createFailAction<TModel extends ViewModel, TDto extends object>(formDef: FormDefinition<TDto>, createModelFunc: (form: IForm<TDto>) => TModel): FailAction {
  return (request: Request<ReqRefDefaults>, h: ResponseToolkit<ReqRefDefaults>, error: Error | undefined) => {
    const form: IForm<TDto> = createFailedForm(formDef, request.payload as TDto, (error as ValidationError).details);
    const model: TModel = createModelFunc(form);
    return h.view(model.view, model).takeover().code(400);
  };
}

export function pagedToPaginated(paged?: IPagedListRequest): IPaginatedListRequest {
  const perPage = paged?.perPage || 25;
  const page = paged?.page ? Math.max(1, paged.page) : 1;
  return {
    skip: perPage * (page - 1),
    take: perPage,
  };
}

export function paginatedToPaged<T>(paginated: IPaginatedListResponse<T>, request: IPagedListRequest): IPagedListResponse<T> {
  const perPage = request?.perPage || 25;
  const maxPage = paginated.total === 0 ? 1 : Math.ceil(paginated.total / perPage);
  return {
    data: paginated.data,
    perPage: perPage,
    totalPages: maxPage,
    page: request?.page && request.page > maxPage ? maxPage : request.page || 1,
  };
}
