import {
    createError,
    readBody,
    setResponseStatus,
} from "h3";

import {
    createDocumentSchema,
} from "../../../validation/document";

import {
    createDocument,
} from "../../../services/document.service";

import {
    TemplateDataValidationError,
    TemplateNotFoundError,
} from "../../../domain/errors";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    const validation =
        createDocumentSchema.safeParse(body);

    if (!validation.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid document payload",
            data: validation.error.flatten(),
        });
    }

    try {
        const document =
            await createDocument(validation.data);

        setResponseStatus(event, 201);

        return document;
    } catch (error) {
        if (error instanceof TemplateNotFoundError) {
            throw createError({
                statusCode: 400,
                statusMessage: error.message,
            });
        }

        if (error instanceof TemplateDataValidationError) {
            throw createError({
                statusCode: 400,
                statusMessage: error.message,
                data: error.issues,
            });
        }

        throw error;
    }
});