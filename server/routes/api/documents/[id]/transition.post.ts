import {
    createError,
    getRouterParam,
    readBody,
} from "h3";

import {
    transitionDocumentSchema,
} from "../../../../validation/document";

import {
    transitionDocument,
} from "../../../../services/document.service";

import {
    InvalidStateTransitionError,
} from "../../../../domain/errors";

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: "Document ID is required",
        });
    }

    const body = await readBody(event);

    const validation =
        transitionDocumentSchema.safeParse(body);

    if (!validation.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid transition payload",
            data: validation.error.flatten(),
        });
    }

    try {
        const document = await transitionDocument(
            id,
            validation.data,
        );

        if (!document) {
            throw createError({
                statusCode: 404,
                statusMessage: "Document not found",
            });
        }

        return document;
    } catch (error) {
        if (error instanceof InvalidStateTransitionError) {
            throw createError({
                statusCode: 400,
                statusMessage: error.message,
            });
        }

        throw error;
    }
});