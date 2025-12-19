import type { RequestHandler } from "./$types";
import { initAuth } from "$lib/auth";

export const GET: RequestHandler = async (event) => {
  try {
    const db = event.platform?.env?.DB;
    if (!db) throw new Error("D1 database not available");
    const auth = initAuth(db, event.platform?.env, event.url.origin);
    return await auth.handler(event.request);
  } catch (error) {
    console.error('Auth GET error:', error);
    return new Response(
      JSON.stringify({ error: 'Authentication service temporarily unavailable' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

export const POST: RequestHandler = async (event) => {
  try {
    const db = event.platform?.env?.DB;
    if (!db) throw new Error("D1 database not available");
    const auth = initAuth(db, event.platform?.env, event.url.origin);
    return await auth.handler(event.request);
  } catch (error) {
    console.error('Auth POST error:', error);
    return new Response(
      JSON.stringify({ error: 'Authentication service temporarily unavailable' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
