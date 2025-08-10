import alchemy from "alchemy";

import { 
  SvelteKit, 
  Worker, 
  DurableObjectNamespace,
  D1Database
} from "alchemy/cloudflare";

import type { CounterDO } from "./worker/index.ts";

const projectName = "remote";

// Debug environment variables
console.log("Environment check:");
console.log("CLOUDFLARE_API_TOKEN:", process.env.CLOUDFLARE_API_TOKEN ? "SET" : "NOT SET");
console.log("CLOUDFLARE_ACCOUNT_ID:", process.env.CLOUDFLARE_ACCOUNT_ID || "NOT SET");
console.log("ALCHEMY_PASSWORD:", process.env.ALCHEMY_PASSWORD ? "SET" : "NOT SET");

const project = await alchemy(projectName, {
  password: process.env.ALCHEMY_PASSWORD || "default-password"
});

const COUNTER_DO = DurableObjectNamespace<CounterDO>(`${projectName}-do`, {
  className: "CounterDO",
  scriptName: `${projectName}-worker`,
  sqlite: true
});

// Create D1 database for auth
const DB = await D1Database(`${projectName}-db`, {
  name: `${projectName}-db`,
  migrationsDir: "migrations",
  adopt: true
});

// Create the worker
export const WORKER = await Worker(`${projectName}-worker`, {
  name: `${projectName}-worker`,
  entrypoint: "./worker/index.ts",
  adopt: true,
  bindings: {
    COUNTER_DO,
  },
  url: false
});

console.log("Worker:", WORKER.url);

export const APP = await SvelteKit(`${projectName}-app`, {
  name: `${projectName}-app`,
  bindings: {
    COUNTER_DO,
    WORKER,
    DB,
  },
  url: true,
  adopt: true,
});

console.log("App:", APP.url);

await project.finalize(); 