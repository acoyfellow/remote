import { getAuth } from "$lib/auth";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async (event) => {
  const auth = getAuth();
  return auth.handler(event.request);
};

export const POST: RequestHandler = async (event) => {
  const auth = getAuth();
  return auth.handler(event.request);
};
