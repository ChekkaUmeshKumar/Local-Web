/** The template registry consumed by the start screen. */

import type { TemplateDef } from "./types";
import { portfolio } from "./portfolio";
import { business } from "./business";
import { restaurant } from "./restaurant";

export const TEMPLATES: TemplateDef[] = [portfolio, business, restaurant];

export type { TemplateDef, SampleFile, TemplateId } from "./types";
