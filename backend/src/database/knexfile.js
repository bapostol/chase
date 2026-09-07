import path from 'path';
import { fileURLToPath } from 'url';
import { CHASE_PATHS } from '../utils/paths.js';

import ClientLibsql from '@libsql/knex-libsql';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  development: {
    client: ClientLibsql,
    connection: {
      filename: `file:${CHASE_PATHS.dbPath}`
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (db, cb) => {
        try {
          db.run("PRAGMA journal_mode = WAL;");
          db.run("PRAGMA foreign_keys = ON;");
          db.run("PRAGMA busy_timeout = 5000;");
          cb(null, db);
        } catch (err) {
          cb(err, db);
        }
      }
    },
    migrations: {
      directory: path.resolve(__dirname, './migrations'),
      tableName: 'chase_migrations'
    }
  }
};
