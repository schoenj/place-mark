import { FormDefinition } from "../abstraction/index.js";
import { ICategoryCreateReadWriteDto } from "../../dtos/index.js";
import { designationInputFieldDef } from "../common-definitions.js";

export const categoryCreateFormDefinition: FormDefinition<ICategoryCreateReadWriteDto> = {
  action: "/category",
  method: "POST",
  fields: {
    designation: designationInputFieldDef,
  },
};
