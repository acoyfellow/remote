import alchemy from "alchemy";
import { 
  SvelteKit, 
  Worker, 
  DurableObjectNamespace
} from "alchemy/cloudflare";
import type { CounterDO } from "./worker/index.ts";

const stage = process.env.ALCHEMY_STAGE || "dev";
const doScriptName = stage === "dev" ? "worker" : "remote-worker";

const app = await alchemy("remote", {
  stage,
  password: process.env.ALCHEMY_PASSWORD || "default-password",
});

const COUNTER_DO = DurableObjectNamespace<CounterDO>("counter-do", {
  className: "CounterDO",
  scriptName: doScriptName,
  sqlite: true
});

// Create the worker
export const worker = await Worker("worker", {
  name: doScriptName,
  entrypoint: "./worker/index.ts",
  adopt: true,
  bindings: {
    COUNTER_DO,
  },
  url: true
});

console.log("Worker:", worker.url);

// // Create the SvelteKit app
export const website = await SvelteKit("website", {
  name: "remote",
  // build: { command: "bun run build" },
  // assets: "./.svelte-kit/output/client",
  bindings: {
    COUNTER_DO,
  },
  url: true,
});

console.log("Website:", website.url);

await app.finalize(); 