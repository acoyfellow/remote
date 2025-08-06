import alchemy from "alchemy";
import { SvelteKit } from "alchemy/cloudflare";

const stage = "dev";

const accountId = ("bfcb6ac5b3ceaf42a09607f6f7925823");

const app = await alchemy("remote", {
  stage,
  password: process.env.ALCHEMY_PASSWORD || "default-password"
});

// Create the SvelteKit app
export const website = await SvelteKit("website", {
  name: "remote",
  // dev: { command: "bun run dev" },
  build: { command: "bun run build" },
  assets: "./.svelte-kit/output/client",
  url: true,
  accountId,
});

console.log("Website:", website.url);

await app.finalize(); 