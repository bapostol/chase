import Database from 'better-sqlite3';
import { CHASE_PATHS } from '../utils/paths.js';

let dbInstance = null;

export async function getDatabase() {
  if (dbInstance) return dbInstance;

  try {
    // Open the SQLite file database directly
    dbInstance = new Database(CHASE_PATHS.dbPath, { verbose: console.log });

    // Enforce runtime performance optimizations via standard PRAGMAs
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    dbInstance.pragma('busy_timeout = 5000');

    return dbInstance;
  } catch (error) {
    console.error("Failed to establish SQLite database connection wrapper:", error);
    throw error;
  }
}
