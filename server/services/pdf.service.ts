import {
    getTemplate,
} from "../templates/registry";

import {
    TemplateNotFoundError,
    TemplateDataValidationError,
} from "../domain/errors";

export async function renderDocumentPdf(
    templateId: string,
    data: unknown,
): Promise<Buffer> {
    const template =
        getTemplate(templateId);

    if (!template) {
        throw new TemplateNotFoundError(
            templateId,
        );
    }
    const validation =
        template.schema.safeParse(data);

    if (!validation.success) {
        throw new TemplateDataValidationError(
            templateId,
            validation.error.flatten(),
        );
    }

    return template.render(
        validation.data,
    );
}
