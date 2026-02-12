/**
 * Initial migration — create all domain tables.
 *
 * Tables: routes, compliance_balances, bank_entries, pools, pool_members
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // --- routes ---
    await knex.schema.createTable('routes', (t) => {
        t.uuid('id').primary().defaultTo(knex.fn.uuid());
        t.string('route_id').unique().notNullable();
        t.string('vessel_type').notNullable();
        t.string('fuel_type').notNullable();
        t.integer('year').notNullable();
        t.float('ghg_intensity').notNullable();
        t.float('fuel_consumption').notNullable();
        t.float('distance').notNullable();
        t.float('total_emissions').notNullable().defaultTo(0);
        t.boolean('is_baseline').notNullable().defaultTo(false);
        t.timestamps(true, true);
    });

    // --- compliance_balances ---
    await knex.schema.createTable('compliance_balances', (t) => {
        t.uuid('id').primary().defaultTo(knex.fn.uuid());
        t.string('ship_id').notNullable();
        t.integer('year').notNullable();
        t.float('cb_gco2eq').notNullable();
        t.unique(['ship_id', 'year']);
        t.timestamps(true, true);
    });

    // --- bank_entries ---
    await knex.schema.createTable('bank_entries', (t) => {
        t.uuid('id').primary().defaultTo(knex.fn.uuid());
        t.string('ship_id').notNullable();
        t.integer('year').notNullable();
        t.float('amount_gco2eq').notNullable();
        t.timestamps(true, true);
    });

    // --- pools ---
    await knex.schema.createTable('pools', (t) => {
        t.uuid('id').primary().defaultTo(knex.fn.uuid());
        t.integer('year').notNullable();
        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });

    // --- pool_members ---
    await knex.schema.createTable('pool_members', (t) => {
        t.uuid('pool_id').notNullable().references('id').inTable('pools').onDelete('CASCADE');
        t.string('ship_id').notNullable();
        t.float('cb_before').notNullable();
        t.float('cb_after').notNullable();
        t.primary(['pool_id', 'ship_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('pool_members');
    await knex.schema.dropTableIfExists('pools');
    await knex.schema.dropTableIfExists('bank_entries');
    await knex.schema.dropTableIfExists('compliance_balances');
    await knex.schema.dropTableIfExists('routes');
}
