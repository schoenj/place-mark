import { FormDefinition, ISelectInput, ITextInput } from "../abstraction/index.js";
import { IPlaceMarkCreateReadWriteDto } from "../../dtos/index.js";
import { designationInputFieldDef, latitudeInputFieldDef, longitudeInputFieldDef } from "../common-definitions.js";

export const placeMarkCreateFormDefinition: FormDefinition<IPlaceMarkCreateReadWriteDto> = {
  action: "/place-mark",
  method: "POST",
  fields: {
    designation: designationInputFieldDef,
    description: {
      type: "text",
      max: 500,
      name: "description",
      placeholder: "A short description ...",
      description: "Description",
    } as ITextInput,
    latitude: latitudeInputFieldDef,
    longitude: longitudeInputFieldDef,
    categoryId: {
      type: "select",
      name: "categoryId",
      description: "Category",
      valueType: "string",
      options: async (container) => {
        const categories = await container.categoryRepository.getLookup$();
        return categories.map((x) => ({ value: x.id, designation: x.designation }));
      },
    } as ISelectInput,
  },
};
