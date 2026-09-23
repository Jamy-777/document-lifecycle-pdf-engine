import {
    getTemplate,
} from "../templates/registry";

import {
    TemplateDataValidationError,
    TemplateNotFoundError,
} from "../domain/errors";

function deepMerge(
    target: any,
    source: any,
): any {
    if (
        typeof target !== "object" ||
        target === null ||
        Array.isArray(target)
    ) {
        return source;
    }

    if (
        typeof source !== "object" ||
        source === null ||
        Array.isArray(source)
    ) {
        return source;
    }

    const result = {
        ...target,
    };

    for (const key of Object.keys(source)) {
        if (
            key in target &&
            typeof target[key] === "object" &&
            target[key] !== null &&
            !Array.isArray(target[key]) &&
            typeof source[key] === "object" &&
            source[key] !== null &&
            !Array.isArray(source[key])
        ) {
            result[key] = deepMerge(
                target[key],
                source[key],
            );
        } else {
            result[key] = source[key];
        }
    }

    return result;
}

export function validateTemplateData(
    templateId: string,
    data: unknown,
) {
    const template =
        getTemplate(templateId);

    if (!template) {
        throw new TemplateNotFoundError(
            templateId,
        );
    }

    const transformedData =
        template.transformInput
            ? template.transformInput(data)
            : data;

    const mergedData = deepMerge(
        template.defaultData,
        transformedData,
    );

    const validation =
        template.schema.safeParse(
            mergedData,
        );

    if (!validation.success) {
        throw new TemplateDataValidationError(
            templateId,
            validation.error.flatten(),
        );
    }

    return validation.data;
}