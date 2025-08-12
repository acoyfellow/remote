import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
} satisfies Config;
