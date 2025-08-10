import { createAuth } from "$lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";

import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {

  const db = event.platform?.env?.DB;
  if (!db) {
    throw new Error('D1 database not available');
  }

  const auth = createAuth(db, event.platform?.env);

  try {
    const session = await auth.api.getSession({
      headers: event.request.headers,
    });
    event.locals.user = session?.user || null;
    event.locals.session = session?.session || null;
  } catch (error) {
    console.error(error);
  }

  return svelteKitHandler({ event, resolve, auth, building });
};