/**
 * Knex configuration — infrastructure layer only.
 *
 * Reads DATABASE_URL from environment.
 * Migrations and seeds live inside infrastructure/db/.
 */

import 'dotenv/config';
import type { Knex } from 'knex';

const config: Record<string, Knex.Config> = {
    development: {
        client: 'pg',
        connection: process.env.DATABASE_URL,
        migrations: {
            directory: './src/infrastructure/db/migrations',
            extension: 'ts',
        },
        seeds: {
            directory: './src/infrastructure/db/seeds',
            extension: 'ts',
        },
    },

    production: {
        client: 'pg',
        connection: {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
        },
        migrations: {
            directory: './src/infrastructure/db/migrations',
            extension: 'ts',
        },
        pool: { min: 2, max: 10 },
    },
};

export default config;
