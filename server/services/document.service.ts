import { eq } from "drizzle-orm";

import { db } from "../db";
import { documents } from "../db/schema";
import type { CreateDocumentInput } from "../validation/document";

export async function createDocument(
    input: CreateDocumentInput,
) {
    const now = new Date();

    const document = {
        id: crypto.randomUUID(),

        templateId: input.templateId,

        title: input.title,

        createdBy: input.createdBy,

        state: "DRAFT" as const,

        data: input.data,

        createdAt: now,

        updatedAt: now,
    };

    await db
        .insert(documents)
        .values(document);

    return document;
}

export async function getDocumentById(
    id: string,
) {
    const result = await db
        .select()
        .from(documents)
        .where(eq(documents.id, id))
        .limit(1);

    return result[0] ?? null;
}