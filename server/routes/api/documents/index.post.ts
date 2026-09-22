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

    const document =
        await createDocument(validation.data);

    setResponseStatus(event, 201);

    return document;
});