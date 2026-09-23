import {
    createError,
    getRouterParam,
} from "h3";

import {
    getDocumentById,
} from "../../../../services/document.service";

import {
    renderDocumentPdf,
} from "../../../../services/pdf.service";

import {
    TemplateDataValidationError,
    TemplateNotFoundError,
} from "../../../../domain/errors";

function sanitizeFilename(
    value: string,
): string {
    return value
        .trim()
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .toLowerCase();
}

export default defineEventHandler(
    async (event) => {
        const id =
            getRouterParam(event, "id");

        if (!id) {
            throw createError({
                statusCode: 400,
                statusMessage:
                    "Document ID is required",
            });
        }

        const document =
            await getDocumentById(id);

        if (!document) {
            throw createError({
                statusCode: 404,
                statusMessage:
                    "Document not found",
            });
        }

        try {
            const pdf =
                await renderDocumentPdf(
                    document.templateId,
                    document.data,
                );

            const filename =
                `${sanitizeFilename(
                    document.title,
                )}.pdf`;

            return new Response(pdf, {
                status: 200,

                headers: {
                    "Content-Type":
                        "application/pdf",

                    "Content-Disposition":
                        `attachment; filename="${filename}"`,

                    "Cache-Control":
                        "no-store",
                },
            });
        } catch (error) {
            if (
                error instanceof
                TemplateNotFoundError
            ) {
                throw createError({
                    statusCode: 500,
                    statusMessage:
                        "Document template is unavailable",
                });
            }

            if (
                error instanceof
                TemplateDataValidationError
            ) {
                throw createError({
                    statusCode: 500,
                    statusMessage:
                        "Stored document data is invalid",
                });
            }

            throw error;
        }
    },
);
