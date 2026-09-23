import type {
    DocumentTemplate,
} from "./types";

import {
    jazzFestivalTicketTemplate,
} from "./jazz-festival-ticket";

const templates = new Map<
    string,
    DocumentTemplate<any>
>();

function registerTemplate(
    template: DocumentTemplate<any>,
) {
    if (templates.has(template.id)) {
        throw new Error(
            `Template "${template.id}" is already registered`,
        );
    }

    templates.set(
        template.id,
        template,
    );
}

registerTemplate(
    jazzFestivalTicketTemplate,
);

export function getTemplate(
    templateId: string,
): DocumentTemplate<any> | null {
    return templates.get(templateId) ?? null;
}

export function hasTemplate(
    templateId: string,
): boolean {
    return templates.has(templateId);
}