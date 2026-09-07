import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/connection.js';
import { CHASE_PATHS } from '../utils/paths.js';
import { ApplicationCreateSchema, ApplicationListResponseSchema } from '../models/applicationModel.js';
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

      // Query combines apps and leverages SQLite's json_group_array to build tags array inside the DB engine
      const rows = await db('applications as a')
        .select(
          'a.id',
          'a.title',
          'a.company',
          'a.url',
          'a.status',
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
  }
};
