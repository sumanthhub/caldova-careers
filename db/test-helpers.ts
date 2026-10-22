import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as schema from './schema';
import type { Database } from '../src/lib/db';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Create a fresh, isolated in-memory libSQL database with all migrations applied.
 *
 * This provides a fast, hermetic SQLite database for testing the applications
 * data layer without relying on filesystem state or manual teardown.
 *
 * @returns A Promise resolving to an initialized Drizzle database client.
 */
export async function createTestDatabase(): Promise<Database> {
    const client = createClient({ url: ':memory:' });
    const db = drizzle(client, { schema });
    await migrate(db, { migrationsFolder: join(here, 'migrations') });
    return db;
}
