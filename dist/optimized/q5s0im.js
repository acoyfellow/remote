import { g } from "../chunks/event.js";
import { q, a } from "../chunks/query.js";
import "@sveltejs/kit";
import "../chunks/event-state.js";
import "../chunks/false.js";
import "../chunks/paths.js";
const getHello = q(async () => {
  console.log("[SERVER] getHello called");
  return "Hello, world!";
});
const testBindings = q(async () => {
  const event = g();
  const platform = event.platform;
  const bindings = {
    hasEnv: !!platform?.env,
    envKeys: platform?.env ? Object.keys(platform.env) : [],
    // Try to access common Cloudflare bindings
    hasKV: !!platform?.env?.KV,
    hasDO: !!platform?.env?.DURABLE_OBJECT,
    hasR2: !!platform?.env?.R2
  };
  return bindings;
});
const sharedLogic = (name) => {
  return `Processed: ${name.toUpperCase()} at ${(/* @__PURE__ */ new Date()).toISOString()}`;
};
const testSharedLogic = q("unchecked", async (name) => {
  console.log(`[SERVER] testSharedLogic called with name: ${name}`);
  const serverResult = sharedLogic(name || "server");
  return {
    serverResult,
    timestamp: Date.now(),
    environment: "server"
  };
});
const getRealtimeData = q(async () => {
  console.log("[SERVER] getRealtimeData called");
  return {
    timestamp: Date.now(),
    randomValue: Math.random(),
    serverTime: (/* @__PURE__ */ new Date()).toISOString(),
    uptime: process.uptime?.() || "unknown"
  };
});
let serverCounter = 0;
const incrementCounter = a(async () => {
  console.log(`[SERVER] incrementCounter called, current value: ${serverCounter}`);
  serverCounter++;
  console.log(`[SERVER] Counter incremented to: ${serverCounter}`);
  return {
    counter: serverCounter,
    message: `Counter incremented to ${serverCounter}`
  };
});
const getCounter = q(async () => {
  console.log(`[SERVER] getCounter called, returning: ${serverCounter}`);
  return { counter: serverCounter };
});
for (const [name, fn] of Object.entries({ getCounter, getHello, getRealtimeData, incrementCounter, testBindings, testSharedLogic })) {
  fn.__.id = "q5s0im/" + name;
  fn.__.name = name;
}
export {
  getCounter,
  getHello,
  getRealtimeData,
  incrementCounter,
  testBindings,
  testSharedLogic
};
