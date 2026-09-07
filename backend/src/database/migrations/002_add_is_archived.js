export const up = async (knex) => {
  await knex.schema.alterTable('applications', (table) => {
    table.boolean('is_archived').notNullable().defaultTo(false);
  });
};

export const down = async (knex) => {
  await knex.schema.alterTable('applications', (table) => {
    table.dropColumn('is_archived');
  });
};