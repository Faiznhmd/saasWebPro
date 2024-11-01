import { env } from '@/data/env/server';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/app/drizzle/schema.ts',
  out: './src/drizzle/migration',
  dialect: 'postgresql',
  strict: true,
  verbose: true,
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});