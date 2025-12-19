import { initAuth } from '$lib/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, platform }) => {
  const url = new URL(request.url);
  const auth = initAuth(platform?.env?.DB!, platform?.env, url.origin);
  return auth.handler(request);
};

export const POST: RequestHandler = async ({ request, platform }) => {
  const url = new URL(request.url);
  const auth = initAuth(platform?.env?.DB!, platform?.env, url.origin);
  return auth.handler(request);
};
