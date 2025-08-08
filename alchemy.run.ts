import alchemy from "alchemy";
import { 
  SvelteKit, 
  Worker, 
  DurableObjectNamespace
} from "alchemy/cloudflare";
import type { CounterDO } from "./worker/index.ts";

const stage = "dev";

const app = await alchemy("remote", {
  stage,
  password: process.env.ALCHEMY_PASSWORD || "default-password",
});

// CounterDO: Simple counter instances
const COUNTER_DO = DurableObjectNamespace<CounterDO>("counter-do", {
  className: "CounterDO",
  scriptName: "remote-worker"
});

// Create the worker
export const worker = await Worker("worker", {
  name: "remote-worker",
  entrypoint: "./worker/index.ts",
  adopt: true,
  bindings: {
    COUNTER_DO,
  },
  url: true,
  dev: {
    port: 1337,
  },
});

console.log("Worker:", worker.url);

// Create the SvelteKit app
export const website = await SvelteKit("website", {
  name: "remote",
  build: { command: "bun run build" },
  assets: "./.svelte-kit/output/client",
  bindings: {
    COUNTER_DO,
  },
  url: true,
});

console.log("Website:", website.url);

await app.finalize(); 