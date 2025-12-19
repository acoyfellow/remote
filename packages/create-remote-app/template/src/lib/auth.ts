import { betterAuth } from 'better-auth';
import { sveltekitCookies } from "better-auth/svelte-kit";
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import { user, session, account, verification } from './schema';
import { getRequestEvent } from '$app/server';

import type { D1Database } from '@cloudflare/workers-types';

let authInstance: ReturnType<typeof betterAuth> | null = null;
let authBaseURL: string | null = null;
let drizzleInstance: ReturnType<typeof drizzle> | null = null;

export function getDrizzle(): ReturnType<typeof drizzle> {
  if (!drizzleInstance) {
    throw new Error('Database not initialized. Call initAuth() first.');
  }
  return drizzleInstance;
}

export function initAuth(db: D1Database, env: any, baseURL: string) {
  if (!db) {
    throw new Error('D1 database is required for Better Auth');
  }

  if (!baseURL) {
    throw new Error("baseURL is required for Better Auth");
  }

  // Create singleton Drizzle instance
  if (!drizzleInstance) {
    drizzleInstance = drizzle(db, {
      schema: {
        user,
        session,
        account,
        verification,
      },
    });
  }

  if (authInstance) {
    if (authBaseURL !== baseURL) {
      throw new Error(`Auth already initialized for ${authBaseURL}, cannot re-init for ${baseURL}`);
    }
    return authInstance;
  }

  authBaseURL = baseURL;
  authInstance = betterAuth({
    trustedOrigins: [
      "http://localhost:5173",
      // TODO: Add your production domains here
      // "https://your-domain.com",
    ],
    database: drizzleAdapter(drizzleInstance, {
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
    secret: env?.BETTER_AUTH_SECRET || (() => {
      throw new Error('BETTER_AUTH_SECRET environment variable is required');
    })(),
    baseURL,
    plugins: [sveltekitCookies(getRequestEvent as any)],
  });

  return authInstance;
}
