import {
    asc,
    eq,
} from "drizzle-orm";

import { db } from "../db";

import {
    auditLogs,
} from "../db/schema";

export async function getAuditTrail(
    documentId: string,
) {
    return db
        .select()
        .from(auditLogs)
        .where(
            eq(auditLogs.documentId, documentId),
        )
        .orderBy(
            asc(auditLogs.timestamp),
        );
}