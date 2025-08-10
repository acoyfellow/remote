import type { LayoutServerLoad } from './$types';
import type { User, Session } from '$lib/schema';

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    user: locals.user as User,
    session: locals.session as Session,
  };
};