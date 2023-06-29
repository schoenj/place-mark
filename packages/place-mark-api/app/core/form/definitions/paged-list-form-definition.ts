import { FormDefinition, ISelectOption } from "../abstraction/index.js";
import { IPagedListRequest } from "../../dtos/index.js";

export const defaultPerPageOptions: ISelectOption[] = [
  { value: "5", designation: "5" },
  { value: "10", designation: "10" },
  { value: "25", designation: "25", selected: true },
  { value: "50", designation: "50" },
  { value: "100", designation: "100" },
];

export function createPagedListFormDefinition(action: string): FormDefinition<IPagedListRequest> {
  return {
    action: action,
    method: "GET",
    fields: {
      perPage: {
        type: "select",
        required: false,
        name: "perPage",
        description: "Per Page",
        options: defaultPerPageOptions,
      },
      page: {
        type: "number",
        required: false,
        name: "page",
        description: "Page",
        min: 1,
      },
    },
  };
}
