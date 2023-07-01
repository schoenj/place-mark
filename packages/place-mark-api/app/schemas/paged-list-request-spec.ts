import Joi from "joi";
import { IPagedListRequest } from "../core/dtos/index.js";

export const pagedListRequestSpec: Joi.ObjectSchema<IPagedListRequest> = Joi.object({
  page: Joi.number().optional().min(1).description("The page to display").example(1),
  perPage: Joi.number().optional().min(1).description("The maximum amount of entries to display on each page").example(20),
});
