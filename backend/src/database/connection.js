import knex from 'knex';
import knexConfig from './knexfile.js';

let knexInstance = null;

export function getDatabase() {
  if (knexInstance) return knexInstance;

  // Initialize the Knex query builder layer using the encapsulated profile properties
  knexInstance = knex(knexConfig.development);
  return knexInstance;
}