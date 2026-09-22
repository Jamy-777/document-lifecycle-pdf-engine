import {
    sqliteTable,
    text,
    integer,
} from "drizzle-orm/sqlite-core";

export const documents = sqliteTable("documents", {
    id: text("id").primaryKey(),

    templateId: text("template_id").notNull(),

    title: text("title").notNull(),

    createdBy: text("created_by").notNull(),

    state: text("state", {
        enum: ["DRAFT", "SENT", "SIGNED", "VOIDED"],
    })
        .notNull()
        .default("DRAFT"),

    data: text("data", { mode: "json" })
        .$type<Record<string, unknown>>()
        .notNull(),

    createdAt: integer("created_at", {
        mode: "timestamp",
    })
        .notNull(),

    updatedAt: integer("updated_at", {
        mode: "timestamp",
    })
        .notNull(),
});

export const auditLogs = sqliteTable("audit_logs", {
    id: text("id").primaryKey(),

    documentId: text("document_id")
        .notNull()
        .references(() => documents.id),

    previousState: text("previous_state", {
        enum: ["DRAFT", "SENT", "SIGNED", "VOIDED"],
    }).notNull(),

    nextState: text("next_state", {
        enum: ["DRAFT", "SENT", "SIGNED", "VOIDED"],
    }).notNull(),

    actor: text("actor").notNull(),

    timestamp: integer("timestamp", {
        mode: "timestamp",
    }).notNull(),

    note: text("note"),
});