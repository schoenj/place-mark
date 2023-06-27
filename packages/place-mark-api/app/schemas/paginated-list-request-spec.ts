import Joi from "joi";
import { IPaginatedListRequest } from "@schoenj/place-mark-core";

export const paginatedListRequestSpec: Joi.ObjectSchema<IPaginatedListRequest> = Joi.object<IPaginatedListRequest>({
  take: Joi.number().min(1).max(100).optional().description("The amount of entries to fetch."),
  skip: Joi.number().min(0).optional().description("The amount of entries to skip"),
})
  .label("PaginatedListRequestDto")
  .description("Implements properties for requesting a paginated list");
