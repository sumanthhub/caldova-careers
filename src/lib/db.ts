/**
 * Database client factory for the anonymous `applications` table.
 *
 * Job postings are content-collection files and never touch this client; the
 * database exists only for the apply flow.
 */
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import * as schema from '../../db/schema';

export type Database = LibSQLDatabase<typeof schema>;

/** Default local libSQL file used when DATABASE_URL is unset. */
const DEFAULT_DATABASE_URL = 'file:./.data/careers.db';

let cachedDb: Database | undefined;

/** Ensure the parent directory exists for a local `file:` libSQL URL. */
function ensureLocalDir(url: string): void {
    if (url.startsWith('file:')) {
        const filePath = url.slice('file:'.length);
        if (filePath && filePath !== ':memory:') {
            mkdirSync(dirname(filePath), { recursive: true });
        }
    }
}

/**
 * Create a Drizzle ORM client configured for the specified libSQL database URL.
 * Automatically ensures the parent directory exists if using a local file path.
 *
 * @param url - Connection URL for libSQL (defaults to DATABASE_URL or a local SQLite file).
 * @returns Configured Drizzle database client instance with application schema.
 */
export function createDatabase(url: string = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL): Database {
    ensureLocalDir(url);
    const client = createClient({ url });
    return drizzle(client, { schema });
}

/**
 * Retrieve the shared singleton Drizzle database instance used by on-demand endpoints.
 * Lazily initializes the connection on first invocation.
 *
 * @returns Cached singleton Drizzle database client.
 */
export function getDatabase(): Database {
    if (!cachedDb) {
        cachedDb = createDatabase();
    }
    return cachedDb;
}
