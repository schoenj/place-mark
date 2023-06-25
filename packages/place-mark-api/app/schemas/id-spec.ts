import Joi from "joi";
import { idSpec } from "./common.js";

export const idParamSpec = Joi.object({ id: idSpec }).label("IdParams");
