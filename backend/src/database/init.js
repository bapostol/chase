import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from './connection.js';
import { CHASE_PATHS } from '../utils/paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function initializeChaseSystem() {
  // 1. Ensure system folders exist inside your ./data partition
  await fs.mkdir(CHASE_PATHS.masterCvsDir, { recursive: true });
  await fs.mkdir(CHASE_PATHS.applicationsDir, { recursive: true });

  const db = await getDatabase();

  // 2. Discover and sort migration scripts cleanly from the local folder
  const migrationsDirectory = path.resolve(__dirname, './migrations');
  const files = await fs.readdir(migrationsDirectory);
  const migrationFiles = files.filter(f => f.endsWith('.sql')).sort();

  let migrationsAppliedCount = 0;

  // 3. Process every single file through the identical logic gate
  for (const file of migrationFiles) {
    let shouldApply = false;

    // Check if the history tracking table exists at all
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='chase_migrations'
    `).get();

    if (!tableExists) {
      // If the table doesn't exist, we must execute the current file (which will be 000)
      shouldApply = true;
    } else {
      // If the table does exist, check if this specific script was already logged
      const loggedMigration = db.prepare(`
        SELECT id FROM chase_migrations WHERE migration_name = ?
      `).get(file);

      if (!loggedMigration) {
        shouldApply = true;
      }
    }

    // 4. Execution & Log Pass
    if (shouldApply) {
      console.log(`Executing migration script: ${file}`);
      const sqlSchema = await fs.readFile(path.join(migrationsDirectory, file), 'utf8');

      try {
        // Step A: Run the raw SQL layout changes immediately
        db.exec(sqlSchema);

        // Step B: Log the application success row (The table is guaranteed to exist now)
        db.prepare('INSERT INTO chase_migrations (migration_name) VALUES (?)').run(file);
        
        migrationsAppliedCount++;
      } catch (error) {
        console.error(`Critical failure while executing schema file ${file}:`, error);
        throw error;
      }
    }
  }

  if (migrationsAppliedCount > 0) {
    console.log(`Database schema update complete. Applied ${migrationsAppliedCount} new migration(s).`);
  } else {
    console.log("Database schema evaluated. No pending migrations found.");
  }
}
