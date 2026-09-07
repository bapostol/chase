export const up = async (knex) => {
  // Applications Table Layout
  await knex.schema.createTable('applications', (table) => {
    table.string('id').primary(); // UUID v4 Text
    table.string('title').notNullable();
    table.string('company').notNullable();
    table.string('url');
    table.string('status').defaultTo('Ready to Apply');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('status', 'idx_applications_status');
  });

  // Iterative CV Drafts Table Layout
  await knex.schema.createTable('cv_drafts', (table) => {
    table.string('id').primary(); // UUID v4 Text
    table.string('application_id').notNullable();
    table.integer('display_version').notNullable();
    table.text('feedback_notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('application_id')
      .references('id')
      .inTable('applications')
      .onDelete('CASCADE');

    table.index('application_id', 'idx_drafts_app');
  });

  // Global Unified Tags Table Layout
  await knex.schema.createTable('tags', (table) => {
    table.string('id').primary(); // UUID v4 Text
    table.string('name').unique().notNullable();
  });

  // Many-to-Many Tags Junction Table Layout
  await knex.schema.createTable('application_tags', (table) => {
    table.string('application_id').notNullable();
    table.string('tag_id').notNullable();

    table.primary(['application_id', 'tag_id']);

    table.foreign('application_id')
      .references('id')
      .inTable('applications')
      .onDelete('CASCADE');

    table.foreign('tag_id')
      .references('id')
      .inTable('tags')
      .onDelete('CASCADE');
  });
};

export const down = async (knex) => {
  // Dropping order must cleanly reverse creation sequence to satisfy foreign key rules
  await knex.schema.dropTableIfExists('application_tags');
  await knex.schema.dropTableIfExists('tags');
  await knex.schema.dropTableIfExists('cv_drafts');
  await knex.schema.dropTableIfExists('applications');
};
