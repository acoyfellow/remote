import type { User, Session } from 'better-auth';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | null;
			session: Session | null;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env?: {
				DB: D1Database;
				MY_DO: DurableObjectNamespace;
				WORKER: Fetcher;
				BETTER_AUTH_SECRET?: string;
				BETTER_AUTH_URL?: string;
			};
		}
	}
}

export {};
