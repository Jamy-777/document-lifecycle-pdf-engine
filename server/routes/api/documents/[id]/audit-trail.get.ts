import {
    createError,
    getRouterParam,
} from "h3";

import {
    getDocumentById,
} from "../../../../services/document.service";

import {
    getAuditTrail,
} from "../../../../services/audit.service";

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: "Document ID is required",
        });
    }

    const document =
        await getDocumentById(id);

    if (!document) {
        throw createError({
            statusCode: 404,
            statusMessage: "Document not found",
        });
    }

    const auditTrail =
        await getAuditTrail(id);

    return auditTrail;
});
