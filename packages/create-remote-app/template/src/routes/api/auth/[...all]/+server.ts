import { initAuth } from '$lib/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, platform }) => {
  const auth = initAuth(platform?.env?.DB!, platform?.env);
  return auth.handler(request);
};

export const POST: RequestHandler = async ({ request, platform }) => {
  const auth = initAuth(platform?.env?.DB!, platform?.env);
  return auth.handler(request);
};
