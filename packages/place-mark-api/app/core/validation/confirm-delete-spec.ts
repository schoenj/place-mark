import { createSpec } from "./spec-generator.js";
import { createConfirmDeleteFormDefinition } from "../form/index.js";

export const confirmDeleteSpec = createSpec(createConfirmDeleteFormDefinition("unused"));
