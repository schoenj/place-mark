import { Lifecycle, ReqRefDefaults, Request, ResponseToolkit } from "@hapi/hapi";
import { ValidationError } from "joi";
import { ViewModel } from "../view-models/index.js";
import { createFailedForm, FormDefinition, IForm } from "../core/index.js";
import FailAction = Lifecycle.FailAction;

export function createFailAction<TModel extends ViewModel, TDto extends object>(formDef: FormDefinition<TDto>, createModelFunc: (form: IForm<TDto>) => TModel): FailAction {
  return (request: Request<ReqRefDefaults>, h: ResponseToolkit<ReqRefDefaults>, error: Error | undefined) => {
    const form: IForm<TDto> = createFailedForm(formDef, request.payload as TDto, (error as ValidationError).details);
    const model: TModel = createModelFunc(form);
    return h.view(model.view, model).takeover().code(400);
  };
}
