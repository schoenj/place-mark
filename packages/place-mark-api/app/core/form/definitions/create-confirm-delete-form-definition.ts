import { FormDefinition } from "../abstraction/index.js";
import { IConfirmDeleteRequest } from "../../dtos/index.js";

export function createConfirmDeleteFormDefinition(action: string): FormDefinition<IConfirmDeleteRequest> {
  return {
    action: action,
    method: "POST",
    fields: {
      confirm: {
        type: "checkbox",
        description: "Confirm deletion",
        value: "confirmed",
        name: "confirm",
        required: true,
      },
    },
  };
}
