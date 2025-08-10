import { betterAuth } from 'better-auth';
import { sveltekitCookies } from "better-auth/svelte-kit";
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import { user, session, account, verification } from './schema';
import { getRequestEvent } from '$app/server';

import type { D1Database } from '@cloudflare/workers-types';

export function createAuth(db: D1Database, env?: any) {
  if (!db) {
    throw new Error('D1 database is required for Better Auth');
  }
  
  const drizzleDb = drizzle(db, {
    schema: {
      user,
      session,
      account,
      verification,
    },
  });

  return betterAuth({
    trustedOrigins: ["http://localhost:3000", "https://example.com"],
    database: drizzleAdapter(drizzleDb, {
      provider: 'sqlite',
      schema: {
        user,
        session,
        account,
        verification,
      },
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      requireEmailVerification: false,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    secret: env?.BETTER_AUTH_SECRET || 'your-secret-key-change-this-in-production',
    baseURL: env?.BETTER_AUTH_URL || 'http://localhost:5173',
    plugins: [sveltekitCookies(getRequestEvent as any)],
  });
}

// Export for CLI schema generation
// export const auth = betterAuth({
//   database: drizzleAdapter({} as any, { provider: 'sqlite' }),
//   emailAndPassword: { enabled: true },
//   secret: 'temp',
//   baseURL: 'http://localhost:5173',
// }); 