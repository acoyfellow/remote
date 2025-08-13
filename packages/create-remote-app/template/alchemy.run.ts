import alchemy from "alchemy";

import { 
  SvelteKit, 
  Worker, 
  DurableObjectNamespace,
  D1Database
} from "alchemy/cloudflare";

// TODO: Import your Durable Object class here
// import type { MyDO } from "./worker/index.ts";

const projectName = "test-local-template";

const project = await alchemy(projectName, {
  password: process.env.ALCHEMY_PASSWORD || "default-password"
});

// TODO: Create your Durable Object namespace
// Replace "MyDO" with your actual Durable Object class name
const MY_DO = DurableObjectNamespace(`${projectName}-do`, {
  className: "MyDO", // Change this to your DO class name
  scriptName: `${projectName}-worker`,
  sqlite: true
});

// Create D1 database for auth (required for Better Auth)
const DB = await D1Database(`${projectName}-db`, {
  name: `${projectName}-db`,
  migrationsDir: "migrations",
  adopt: true,
});

// Create the worker that hosts your Durable Objects
export const WORKER = await Worker(`${projectName}-worker`, {
  name: `${projectName}-worker`,
  entrypoint: "./worker/index.ts",
  adopt: true,
  bindings: {
    MY_DO, // Add your DO bindings here
  },
  url: false
});

// Create the SvelteKit app
export const APP = await SvelteKit(`${projectName}-app`, {
  name: `${projectName}-app`,
  bindings: {
    MY_DO,   // Make your DO available to SvelteKit
    WORKER,  // Make worker available for service bindings
    DB,      // Database for Better Auth
  },
  url: true,
  adopt: true,
  env: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "85000968f86b5d30510b5b73186b914c430f8e1573614a6d75ed4cc53383517a",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
  }
});

await project.finalize();
