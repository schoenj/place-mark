import { FormDefinition } from "../abstraction/index.js";
import { IPlaceMarkCreateReadWriteDto } from "../../dtos/index.js";
import { categoryInputFieldDef, descriptionInputFieldDef, designationInputFieldDef, latitudeInputFieldDef, longitudeInputFieldDef } from "../common-definitions.js";

export const placeMarkCreateFormDefinition: FormDefinition<IPlaceMarkCreateReadWriteDto> = {
  action: "/place-mark",
  method: "POST",
  fields: {
    designation: designationInputFieldDef,
    description: descriptionInputFieldDef,
    latitude: latitudeInputFieldDef,
    longitude: longitudeInputFieldDef,
    categoryId: categoryInputFieldDef,
  },
};
