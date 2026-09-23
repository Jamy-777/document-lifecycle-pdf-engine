import { and, eq } from "drizzle-orm";

import { db } from "../db";
import { documents } from "../db/schema";
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

    const result = await db
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
        .returning();

    if (result.length === 0) {
        throw new Error(
            "Document state changed during transition",
        );
    }

    return result[0];
}