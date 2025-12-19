import alchemy from "alchemy";

import {
  SvelteKit,
  Worker,
  DurableObjectNamespace,
  D1Database
} from "alchemy/cloudflare";

import { CloudflareStateStore } from "alchemy/state";

import type { CounterDO } from "./worker/index.ts";

const projectName = "remote";

const app = await alchemy(projectName, {
  password: process.env.ALCHEMY_PASSWORD || "default-password",
  stateStore: (scope) => new CloudflareStateStore(scope),
});

// For prod: use fixed names (protect existing resources)
// For previews (pr-123): use stage-scoped names (isolated, disposable)
const isProd = app.stage === "prod";
const prefix = isProd ? projectName : `${app.stage}-${projectName}`;

const COUNTER_DO = DurableObjectNamespace<CounterDO>(`${projectName}-do`, {
  className: "CounterDO",
  scriptName: `${prefix}-worker`,
  sqlite: true
});

// D1 database for auth
// IMPORTANT: prod uses "remote-db", previews use "pr-123-remote-db"
const DB = await D1Database(`${projectName}-db`, {
  name: `${prefix}-db`,
  migrationsDir: "migrations",
  adopt: true,
});

// Worker that hosts Durable Objects
export const WORKER = await Worker(`${projectName}-worker`, {
  name: `${prefix}-worker`,
  entrypoint: "./worker/index.ts",
  adopt: true,
  bindings: {
    COUNTER_DO,
  },
  url: false
});

// SvelteKit app
export const APP = await SvelteKit(`${projectName}-app`, {
  name: `${prefix}-app`,
  bindings: {
    COUNTER_DO,
    WORKER,
    DB,
  },
  url: true,
  adopt: true,
  env: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "default-secret",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
  }
});

await app.finalize(); 