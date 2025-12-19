import { initAuth } from "$lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import { error } from "@sveltejs/kit";

import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  try {
    const db = event.platform?.env?.DB;

    if (!db) return error(500, 'D1 database not available');

    // Initialize auth for this origin (previews/prod/local)
    const auth = initAuth(db, event.platform?.env, event.url.origin);

    try {
      const session = await auth.api.getSession({
        headers: event.request.headers,
      });
      event.locals.user = session?.user || null;
      event.locals.session = session?.session || null;
    } catch (sessionError) {
      console.error('Session loading error:', sessionError);
      event.locals.user = null;
      event.locals.session = null;
    }

    const response = await svelteKitHandler({ event, resolve, auth, building });
    return response;

  } catch (criticalError) {
    console.error('Critical error in handle:', criticalError);

    // Graceful fallback - serve app without auth
    event.locals.user = null;
    event.locals.session = null;

    try {
      return await resolve(event);
    } catch (resolveError) {
      console.error('Failed to resolve even without auth:', resolveError);
      return error(500, 'Service temporarily unavailable');
    }
  }
};