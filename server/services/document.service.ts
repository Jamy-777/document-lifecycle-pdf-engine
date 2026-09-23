import { and, eq } from "drizzle-orm";

import { db } from "../db";

import {
    documents,
    auditLogs,
} from "../db/schema";
import type { CreateDocumentInput } from "../validation/document";

import {
    canTransition,
    type DocumentState,
} from "../domain/document-state";

import {
    InvalidStateTransitionError,
} from "../domain/errors";

import type {
    TransitionDocumentInput,
} from "../validation/document";

import {
    validateTemplateData,
} from "./template.service";

export async function createDocument(
    input: CreateDocumentInput,
) {
    const validateData =
        validateTemplateData(
            input.templateId,
            input.data,
        );

    const now = new Date();

    const document = {
        id: crypto.randomUUID(),

        templateId: input.templateId,

        title: input.title,

        createdBy: input.createdBy,

        state: "DRAFT" as const,

        data: validateData,

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

export async function transitionDocument(
    id: string,
    input: TransitionDocumentInput,
) {
    const document = await getDocumentById(id);

    if (!document) {
        return null;
    }

    const currentState =
        document.state as DocumentState;

    const nextState =
        input.action as DocumentState;

    if (!canTransition(currentState, nextState)) {
        throw new InvalidStateTransitionError(
            currentState,
            nextState,
        );
    }

    const now = new Date();

    return db.transaction((tx) => {
        const updatedDocuments = tx
            .update(documents)
            .set({
                state: nextState,
                updatedAt: now,
            })
            .where(
                and(
                    eq(documents.id, id),
                    eq(documents.state, currentState),
                ),
            )
            .returning()
            .all();

        if (updatedDocuments.length === 0) {
            throw new Error(
                "Document state changed during transition",
            );
        }

        tx.insert(auditLogs)
            .values({
                id: crypto.randomUUID(),

                documentId: id,

                previousState: currentState,

                nextState,

                actor: input.actor,

                timestamp: now,

                note: input.note ?? null,
            })
            .run();

        return updatedDocuments[0];
    });
}