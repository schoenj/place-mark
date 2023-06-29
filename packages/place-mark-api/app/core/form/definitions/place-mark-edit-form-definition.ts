import { FormDefinition, IInputBase } from "../abstraction/index.js";
import { IPlaceMarkReadWriteDto } from "../../dtos/index.js";
import { categoryInputFieldDef, descriptionInputFieldDef, designationInputFieldDef, latitudeInputFieldDef, longitudeInputFieldDef } from "../common-definitions.js";

export const placeMarkEditFormDefinition: FormDefinition<IPlaceMarkReadWriteDto> = {
  action: "/place-mark/edit",
  method: "POST",
  fields: {
    id: {
      type: "text",
      name: "id",
      required: true,
    } as IInputBase,
    designation: designationInputFieldDef,
    description: descriptionInputFieldDef,
    latitude: latitudeInputFieldDef,
    longitude: longitudeInputFieldDef,
    categoryId: categoryInputFieldDef,
  },
};
