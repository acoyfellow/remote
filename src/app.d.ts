import type { D1Database } from "@cloudflare/workers-types";
import type { User as BetterAuthUser, Session as BetterAuthSession } from "better-auth";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
      user: BetterAuthUser | null;
      session: BetterAuthSession | null;
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
