import { Module, Global, OnApplicationShutdown, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { DbContextService } from './db-context.service';
import { PG_POOL } from './database.constants';

@Global()
@Module({
    providers: [{
            provide: PG_POOL,
            useFactory: () => {
                const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
                const missingEnv = requiredEnv.filter((key) => !process.env[key]);

                if (missingEnv.length > 0) {
                    throw new Error(`Missing database environment variables: ${missingEnv.join(', ')}`);
                }

                const pool = new Pool({
                    host: process.env.DB_HOST,
                    port: Number(process.env.DB_PORT || 5432),
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_NAME,
                    max: 10,
                    connectionTimeoutMillis: 10000,
                    idleTimeoutMillis: 30000,
                    keepAlive: true,
                    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
                });

                pool.on('error', (err) => {
                    console.error('Unexpected error on idle PostgreSQL client:', err);
                });
                return pool;
            },
        },
        DbContextService,
    ],
    exports: [PG_POOL, DbContextService],
})
export class DatabaseModule implements OnApplicationShutdown {
    constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

    async onApplicationShutdown() {
        await this.pool.end();
    }
}