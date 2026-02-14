/**
 * Database connection — infrastructure layer.
 *
 * Exports a single Knex instance for use by outbound adapters.
 * This is the ONLY place framework (Knex) is instantiated.
 */

import 'dotenv/config';
import knex from 'knex';
import type { Knex } from 'knex';
import knexConfig from '../../../knexfile';

const env = process.env.NODE_ENV || 'development';

// Handle CJS/ESM interop — ts-jest may wrap the default export
const resolvedConfig = (knexConfig as any).default ?? knexConfig;
const envConfig = resolvedConfig[env] ?? resolvedConfig['development'];

const db: Knex = knex(envConfig);

export default db;
