import { getAuth } from "$lib/auth";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async (event) => {
  try {
    const auth = getAuth();
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
    const auth = getAuth();
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
