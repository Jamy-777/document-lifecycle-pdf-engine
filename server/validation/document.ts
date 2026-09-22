import { z } from "zod";

export const createDocumentSchema = z.object({
    templateId: z.string().min(1),

    title: z.string().min(1),

    createdBy: z.string().min(1),

    data: z.record(
        z.string(),
        z.unknown(),
    ),
});

export type CreateDocumentInput =
    z.infer<typeof createDocumentSchema>;