import alchemy from "alchemy";

import { 
  SvelteKit, 
  Worker, 
  DurableObjectNamespace
} from "alchemy/cloudflare";

import type { CounterDO } from "./worker/index.ts";

const projectName = "remote";

const project = await alchemy(projectName, {
  password: process.env.ALCHEMY_PASSWORD || "default-password",
});

const COUNTER_DO = DurableObjectNamespace<CounterDO>(`${projectName}-do`, {
  className: "CounterDO",
  scriptName: projectName,
  sqlite: true
});

// Create the worker
export const worker = await Worker(`${projectName}-worker`, {
  name: projectName,
  entrypoint: "./worker/index.ts",
  adopt: true,
  bindings: {
    COUNTER_DO,
  },
  url: true
});

console.log("Worker:", worker.url);

// // Create the SvelteKit app
export const app = await SvelteKit(`${projectName}-app`, {
  name: `${projectName}-app`,
  bindings: {
    COUNTER_DO,
    WORKER: worker,
  },
  url: true,
});

console.log("App:", app.url);

await project.finalize(); 