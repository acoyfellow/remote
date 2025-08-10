import { createAuth } from "$lib/auth";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async (event) => {
  const db = event.platform?.env?.DB;
  if (!db) {
    throw new Error('D1 database not available');
  }

  const auth = createAuth(db, event.platform?.env);
  console.log('GET >>>>>>', auth);
  return auth.handler(event.request);
};

export const POST: RequestHandler = async (event) => {
  const db = event.platform?.env?.DB;
  if (!db) {
    throw new Error('D1 database not available');
  }

  const auth = createAuth(db, event.platform?.env);
  console.log('POST >>>>>>', auth);
  return auth.handler(event.request);
};
