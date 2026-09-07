import fs from 'fs/promises';
import { getDatabase } from './connection.js';
import { CHASE_PATHS } from '../utils/paths.js';
import { ProfileSchema } from '../models/profileModel.js';

export async function initializeChaseSystem() {
  await fs.mkdir(CHASE_PATHS.masterCvsDir, { recursive: true });
  await fs.mkdir(CHASE_PATHS.applicationsDir, { recursive: true });

  const db = getDatabase();

  // Profile validation generator
  try {
    await fs.access(CHASE_PATHS.profileJson);
  } catch {
    console.log("Profile store not found. Compiling a strongly typed profile.json template...");

    try {
      const cleanBlankProfile = ProfileSchema.parse({
        name: "",
        email: "",
        phone: "",
        location: "",
        website: "",
        github: "",
        linkedin: "",
        summary_baseline: "",
        is_profile_complete: false
      });

      await fs.writeFile(
        CHASE_PATHS.profileJson,
        JSON.stringify(cleanBlankProfile, null, 2),
        'utf8'
      );
      console.log("Successfully generated a valid profile.json template inside your data directory.");
    } catch (validationError) {
      console.error("Failed to generate type-safe default profile layout:", validationError);
      throw validationError;
    }
  }

  // Database migrations
  try {
    console.log("Evaluating database schema migrations via Knex...");

    const [batchNo, logFiles] = await db.migrate.latest();

    if (logFiles.length > 0) {
      console.log(`Database schema update complete. Applied ${logFiles.length} new migration(s) in batch ${batchNo}.`);
    } else {
      console.log("Database schema evaluated. No pending migrations found.");
    }
  } catch (error) {
    console.error("Critical database schema migration failure:", error);
    throw error;
  }
}
