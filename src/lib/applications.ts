/**
 * Validation and persistence for job applications.
 *
 * The Zod schema is exported on its own so it can be unit tested as pure logic,
 * and reused by the `/api/apply` endpoint. Applications are not authenticated;
 * the candidate supplies their name and email directly on the form.
 */
import { z } from 'zod';
import type { Database } from './db';
import { applications } from '../../db/schema';

export const applicationSchema = z.object({
    jobId: z.string().min(1, 'A job is required.'),
    name: z.string().min(1, 'Your name is required.').max(200),
    email: z.email('Enter a valid email address.').max(320),
    note: z.string().max(2000).optional(),
    links: z.string().max(500).optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

/**
 * Validate and insert a candidate application record into the database.
 * Normalizes input strings by trimming whitespace and converting blank optional fields to null.
 *
 * @param db - The Drizzle database client to execute the insert query.
 * @param input - Raw application payload to validate against applicationSchema and persist.
 * @returns A Promise resolving to the newly generated application ID number.
 * @throws {z.ZodError} If input fails schema validation.
 */
export async function createApplication(db: Database, input: unknown): Promise<number> {
    const data = applicationSchema.parse(input);
    const [row] = await db
        .insert(applications)
        .values({
            jobId: data.jobId,
            name: data.name.trim(),
            email: data.email.trim(),
            note: data.note?.trim() ? data.note.trim() : null,
            links: data.links?.trim() ? data.links.trim() : null,
        })
        .returning({ id: applications.id });
    return row.id;
}
