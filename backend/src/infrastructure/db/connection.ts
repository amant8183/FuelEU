/**
 * Database connection — infrastructure layer.
 *
 * Exports a single Knex instance for use by outbound adapters.
 * This is the ONLY place framework (Knex) is instantiated.
 */

import knex, { Knex } from 'knex';
import knexConfig from '../../../knexfile';

const env = process.env.NODE_ENV || 'development';

const db: Knex = knex(knexConfig[env]);

export default db;
