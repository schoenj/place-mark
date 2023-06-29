import { FormDefinition, IInputBase } from "../abstraction/index.js";
import { ICategoryReadWriteDto } from "../../dtos/index.js";
import { designationInputFieldDef } from "../common-definitions.js";

export const categoryEditFormDefinition: FormDefinition<ICategoryReadWriteDto> = {
  action: "/category/edit",
  method: "POST",
  fields: {
    id: {
      type: "text",
      name: "id",
      required: true,
    } as IInputBase,
    designation: designationInputFieldDef,
  },
};
