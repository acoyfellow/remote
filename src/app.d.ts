import type { D1Database } from "@cloudflare/workers-types";
import type { User, Session } from "$lib/types";

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
				env: {
					COUNTER_DO: DurableObjectNamespace;
					WORKER: Fetcher;
					DB: D1Database;
				};
		}
	}
}

export {};
