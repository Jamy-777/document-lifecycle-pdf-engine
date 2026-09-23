import type {
    DocumentTemplate,
} from "../types";

import {
    jazzFestivalTicketSchema,
    type JazzFestivalTicketData,
} from "./schema";

import {
    jazzFestivalTicketFixture,
} from "./fixture";

import {
    transformJazzFestivalTicketInput,
} from "./transform";

export const jazzFestivalTicketTemplate:
    DocumentTemplate<JazzFestivalTicketData> = {
    id: "jazz-festival-ticket",

    name: "VIP Weekend Pass - Jazz Festival",

    schema: jazzFestivalTicketSchema,

    defaultData: jazzFestivalTicketFixture,

    transformInput:
        transformJazzFestivalTicketInput,
};