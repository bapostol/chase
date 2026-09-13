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

    // Fetch specific job
    async get(req, res) {
        const { id } = req.params;
        const db = getDatabase();

        try {
            // 1. Query the primary application tracking metadata row from SQLite
            const application = await db('applications').where({ id }).first();
            if (!application) {
                return res.status(404).json({ error: 'Application tracking record not found.' });
            }

            // 2. Parse relational tags from junction mapping tables
            const tagsRows = await db('application_tags')
                .join('tags', 'application_tags.tag_id', 'tags.id')
                .where('application_tags.application_id', id)
                .select('tags.name');

            application.tags = tagsRows.map(row => row.name);

            // 3. READ THE TEXT FROM DISK: Fetch the isolated job description file text stream
            const jobDescFilePath = CHASE_PATHS.getJobDescriptionPath(id);
            try {
                application.description_text = await fs.readFile(jobDescFilePath, 'utf8');
            } catch (fileError) {
                console.warn(`Warning: Missing or unreadable job_desc.txt at path: ${jobDescFilePath}. Defaulting to blank.`);
                application.description_text = ''; // Resilient fallback if file was manually erased
            }

            return res.json(application);
        } catch (error) {
            console.error('Failed to retrieve full application telemetry context:', error);
            return res.status(500).json({ error: 'Internal server error reading application tracking files.' });
        }
    },


    // Update specified fields dynamically (Handles Kanban drag-drops and inline edits)
    async update(req, res) {
        const { id } = req.params;
        const { title, company, url, status, is_archived, tags, description_text } = req.body;

        const db = getDatabase();

        try {
            // 1. Verify that the primary application tracking record exists
            const existingApp = await db('applications').where({ id }).first();
            if (!existingApp) {
                return res.status(404).json({ error: 'Application tracking record not found.' });
            }

            // 2. Synchronize raw description text changes directly to disk storage files
            if (description_text !== undefined && typeof description_text === 'string') {
                const applicationFolder = CHASE_PATHS.getApplicationFolder(id);
                const jobDescFilePath = CHASE_PATHS.getJobDescriptionPath(id);

                await fs.mkdir(applicationFolder, { recursive: true });
                await fs.writeFile(jobDescFilePath, description_text.trim(), 'utf8');
            }

            // 3. MANY-TO-MANY NORMALIZED TAG SYNCHRONIZATION
            if (tags !== undefined && Array.isArray(tags)) {
                await db.transaction(async (trx) => {
                    const resolvedTagIds = [];

                    // Process each tag string safely one by one
                    for (const rawTag of tags) {
                        const cleanName = rawTag.trim().toLowerCase();
                        if (!cleanName) continue;

                        // Check if the global tag row already exists inside the unified index
                        let tagRecord = await trx('tags').where({ name: cleanName }).first();

                        // If it's a completely new tag keyword, create its unified row entry
                        if (!tagRecord) {
                            const newTagId = crypto.randomUUID();
                            await trx('tags').insert({
                                id: newTagId,
                                name: cleanName
                            });
                            resolvedTagIds.push(newTagId);
                        } else {
                            resolvedTagIds.push(tagRecord.id);
                        }
                    }

                    // Clear historical map entries out of your junction table for this application ID
                    await trx('application_tags').where({ application_id: id }).del();

                    // Link your resolved mapping IDs back into your junction ledger table
                    if (resolvedTagIds.length > 0) {
                        const junctionInsertRows = resolvedTagIds.map(resolvedId => ({
                            application_id: id,
                            tag_id: resolvedId
                        }));
                        await trx('application_tags').insert(junctionInsertRows);
                    }
                });
            }

            // 4. Compile flat database update payload dictionary
            const dbUpdateData = {};
            if (title !== undefined) dbUpdateData.title = title.trim();
            if (company !== undefined) dbUpdateData.company = company.trim();
            if (url !== undefined) dbUpdateData.url = url ? url.trim() : null;
            if (status !== undefined) dbUpdateData.status = status;
            if (is_archived !== undefined) dbUpdateData.is_archived = is_archived ? 1 : 0;

            // 5. Update flat row parameters cleanly (No updated_at column dependency)
            if (Object.keys(dbUpdateData).length > 0) {
                await db('applications').where({ id }).update(dbUpdateData);
            }

            // 6. Query and re-assemble the final application object package to return to the client
            const updatedApp = await db('applications').where({ id }).first();

            // Perform a join query across your junction table to pull out the string text array
            const liveTagsRows = await db('application_tags')
                .join('tags', 'application_tags.tag_id', 'tags.id')
                .where('application_tags.application_id', id)
                .select('tags.name');

            updatedApp.tags = liveTagsRows.map(row => row.name);

            // Re-read description file off disk storage to keep state fully verified
            updatedApp.description_text = description_text !== undefined
                ? description_text
                : await fs.readFile(CHASE_PATHS.getJobDescriptionPath(id), 'utf8').catch(() => '');

            return res.json({
                message: 'Application matrix and disk tracking files successfully synchronized.',
                application: updatedApp
            });

        } catch (error) {
            console.error('Failed to patch application tracking node parameters:', error);
            return res.status(500).json({ error: 'Internal failure updating application metadata assets.' });
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
