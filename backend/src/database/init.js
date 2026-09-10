import fs from 'fs/promises';
import path from 'path';
import { getDatabase } from './connection.js';
import { CHASE_PATHS, ALLOWED_CATEGORIES } from '../utils/paths.js';
import { ProfileSchema } from '../models/profileModel.js';

export async function initializeChaseSystem() {
  // 1. Ensure core document and asset hierarchies exist
  await fs.mkdir(CHASE_PATHS.masterCvsDir, { recursive: true });
  await fs.mkdir(CHASE_PATHS.applicationsDir, { recursive: true });

  // 2. Ensure fixed skill directories folders exist
  for (const cat of ALLOWED_CATEGORIES) {
    const targetFolder = path.join(CHASE_PATHS.skillsDir, cat);
    await fs.mkdir(targetFolder, { recursive: true });

    // Seed an initial baseline text placeholder if default.md doesn't exist
    const defaultFileTarget = path.join(targetFolder, 'default.md');
    try {
      await fs.access(defaultFileTarget);
    } catch {
      const templateNotice = `# Baseline Prompt Context: ${cat.replace('_', ' ').toUpperCase()}\n\n[Add your specialized prompt templates and local 70B system instructions here]`;
      await fs.writeFile(defaultFileTarget, templateNotice, 'utf8');
      console.log(`Seeded missing default template anchor at: data/skills/${cat}/default.md`);
    }
  }

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
