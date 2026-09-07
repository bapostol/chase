import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/connection.js';
import { CHASE_PATHS } from '../utils/paths.js';
import { ApplicationCreateSchema, ApplicationResponseSchema, ApplicationListResponseSchema, ApplicationPatchSchema } from '../models/applicationModel.js';
import { ZodError } from 'zod';

export const applicationController = {
    // Create a new job application workspace (Strongly typed)
    async create(req, res) {
        try {
            // 1. Strict validation pass check: isolates inputs and applies default parameters
            /** @type {import('../models/applicationModel.js').ApplicationCreateInput} */
            const inputData = ApplicationCreateSchema.parse(req.body);

            const db = getDatabase();
            const applicationId = uuidv4();

            // 2. Synchronize with the file system layout
            const appFolderPath = CHASE_PATHS.getApplicationFolder(applicationId);
            const jdFilePath = CHASE_PATHS.getJobDescriptionPath(applicationId);
            await fs.mkdir(appFolderPath, { recursive: true });

            try {
                // 3. Open an atomic database transaction loop
                await db.transaction(async (trx) => {
                    // Insert core application parameters
                    await trx('applications').insert({
                        id: applicationId,
                        title: inputData.title,
                        company: inputData.company,
                        url: inputData.url || null,
                        status: inputData.status
                    });

                    // 4. Process standardized tag structures
                    for (let tagName of inputData.tags) {
                        const sanitizedTag = tagName.toLowerCase();
                        if (!sanitizedTag) continue;

                        // Ensure unique global tag footprint existence
                        let tagRow = await trx('tags').where({ name: sanitizedTag }).first();
                        let tagId;

                        if (!tagRow) {
                            tagId = uuidv4();
                            await trx('tags').insert({ id: tagId, name: sanitizedTag });
                        } else {
                            tagId = tagRow.id;
                        }

                        // Bind transaction records inside the many-to-many junction matrix
                        await trx('application_tags').insert({
                            application_id: applicationId,
                            tag_id: tagId
                        });
                    }
                });

                // 5. File System Flush: Directly write the mandatory description text to disk
                await fs.writeFile(jdFilePath, inputData.description_text, 'utf8');

                res.status(201).json({
                    id: applicationId,
                    message: 'Application workspace initialized successfully.'
                });

            } catch (dbError) {
                console.error('Database transaction failure during application write:', dbError);

                // Defensive Rollback: Erase directory structures if database write breaks
                await fs.rm(appFolderPath, { recursive: true, force: true });
                throw dbError;
            }

        } catch (error) {
            // Catch type validation errors and output the precise location mismatches
            if (error instanceof ZodError) {
                return res.status(400).json({ error: 'Validation failed.', details: error.errors });
            }

            console.error('Failed to execute application insertion payload:', error);
            res.status(500).json({ error: 'Failed to write application payload to storage layers.' });
        }
    },

    // Fetch all jobs along with their aggregated tags for the Kanban layout
    async getAll(req, res) {
        try {
            const db = getDatabase();
            const showArchived = req.query.archived === 'true';

            // Query combines apps and leverages SQLite's json_group_array to build tags array inside the DB engine
            const rows = await db('applications as a')
                .select(
                    'a.id',
                    'a.title',
                    'a.company',
                    'a.url',
                    'a.status',
                    'a.is_archived',
                    'a.created_at',
                    db.raw(`
            COALESCE(
              (
                SELECT json_group_array(t.name)
                FROM application_tags at
                JOIN tags t ON at.tag_id = t.id
                WHERE at.application_id = a.id
              ), 
              '[]'
            ) as tags_json
          `)
                )
                .where('a.is_archived', showArchived)
                .orderBy('a.created_at', 'desc');

            // Parse JSON strings back to native JS arrays for Zod validation mapping
            const formattedRows = rows.map(row => {
                let parsedTags = [];
                try {
                    parsedTags = JSON.parse(row.tags_json);
                    // Strip out null values if any edge case orphans exist in your database junction matrix
                    parsedTags = parsedTags.filter(t => t !== null);
                } catch {
                    parsedTags = [];
                }

                return {
                    id: row.id,
                    title: row.title,
                    company: row.company,
                    url: row.url,
                    status: row.status,
                    tags: parsedTags,
                    is_archived: row.is_archived == 1,
                    created_at: row.created_at
                };
            });

            // Strict validation layer check over the list matrix output array
            const verifiedList = ApplicationListResponseSchema.parse(formattedRows);

            res.json(verifiedList);
        } catch (error) {
            console.error('Failed to query application matrix ledger:', error);
            res.status(500).json({ error: 'Failed to fetch tracking matrix fields.' });
        }
    },

    // Update specified fields dynamically (Handles Kanban drag-drops and inline edits)
    async update(req, res) {
        const { id } = req.params;

        try {
            const partialInput = ApplicationPatchSchema.parse(req.body);
            const db = getDatabase();

            const currentApp = await db('applications').where({ id }).first();
            if (!currentApp) {
                return res.status(404).json({ error: 'Application entry not found.' });
            }

            // Separate explicit tags key from core columns
            const { tags, ...coreFieldsToUpdate } = partialInput;

            await db.transaction(async (trx) => {
                if (Object.keys(coreFieldsToUpdate).length > 0) {
                    await trx('applications').where({ id }).update(coreFieldsToUpdate);
                }

                // Only modify application_tags if 'tags' was explicitly provided in the raw request body
                if ('tags' in req.body && Array.isArray(tags)) {
                    await trx('application_tags').where({ application_id: id }).del();

                    for (let tagName of tags) {
                        const sanitizedTag = tagName.trim().toLowerCase();
                        if (!sanitizedTag) continue;

                        let tagRow = await trx('tags').where({ name: sanitizedTag }).first();
                        let tagId;

                        if (!tagRow) {
                            tagId = uuidv4();
                            await trx('tags').insert({ id: tagId, name: sanitizedTag });
                        } else {
                            tagId = tagRow.id;
                        }

                        await trx('application_tags').insert({
                            application_id: id,
                            tag_id: tagId
                        });
                    }
                }
            });

            // Fetch and return the fully aggregated updated record to confirm tag state
            const row = await db('applications as a')
                .select(
                    'a.id', 'a.title', 'a.company', 'a.url', 'a.status', 'a.is_archived', 'a.created_at',
                    db.raw(`(SELECT COALESCE(json_group_array(t.name), '[]') FROM application_tags at JOIN tags t ON at.tag_id = t.id WHERE at.application_id = a.id) as tags_json`)
                )
                .where('a.id', id)
                .first();

            row.is_archived = row.is_archived == 1

            const formattedRow = {
                ...row,
                tags: JSON.parse(row.tags_json).filter(t => t !== null)
            };

            const verifiedResponse = ApplicationResponseSchema.parse(formattedRow);
            res.json({ message: 'Update completed successfully.', application: verifiedResponse });

        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({ error: 'Validation failed.', details: error.errors });
            }

            console.error('Failed to patch application entry:', error);
            res.status(500).json({ error: 'Failed to update application entity fields.' });
        }
    },

    // Permanently delete an application and recursively wipe its folder off disk
    async delete(req, res) {
        const { id } = req.params;

        // Enforce loose strict UUID check validation rule layout format
        if (!id || id.length !== 36) {
            return res.status(400).json({ error: 'Invalid application identification token.' });
        }

        try {
            const db = getDatabase();
            const appFolderPath = CHASE_PATHS.getApplicationFolder(id);

            // 1. Structural Check: Confirm entity footprint exists inside database
            const currentApp = await db('applications').where({ id }).first();
            if (!currentApp) {
                return res.status(404).json({ error: 'Application entry not found.' });
            }

            // 2. Erase row from database (Cascades automatically via schema constraints)
            await db('applications').where({ id }).del();

            // 3. File System Wipe: Recursively clean the application container directory array off disk
            await fs.rm(appFolderPath, { recursive: true, force: true });

            res.json({ message: 'Application deleted and storage workspace wiped completely.' });
        } catch (error) {
            console.error('Failed to execute permanent application deletion loop:', error);
            res.status(500).json({ error: 'Failed to complete core data teardown sequence.' });
        }
    }
};
