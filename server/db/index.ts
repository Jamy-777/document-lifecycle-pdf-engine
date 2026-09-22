import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

const databasePath =
    process.env.DB_FILE_NAME ?? "local.db";

const sqlite = new Database(databasePath, {
    create: true,
});

sqlite.exec("PRAGMA foreign_keys = ON;");

export const db = drizzle(sqlite);