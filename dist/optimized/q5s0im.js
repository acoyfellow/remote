import { g } from "../chunks/event.js";
import { q, a } from "../chunks/query.js";
import "@sveltejs/kit";
import { c } from "../chunks/auth.js";
import "../chunks/event-state.js";
import "../chunks/false.js";
import "../chunks/paths.js";
function buildWorkerUrl(endpoint) {
  return `http://worker${endpoint}`;
}
async function callWorker(platform, endpoint, options = {}) {
  const url = buildWorkerUrl(endpoint);
  const request = new Request(url, options);
  return platform.env.WORKER.fetch(request);
}
async function callWorkerJSON(platform, endpoint, options) {
  const res = await callWorker(platform, endpoint, options);
  if (!res.ok) throw new Error(`Worker ${res.status}: ${await res.text()}`);
  return res.json();
}
const getCounter = q("unchecked", async (counterId = "default") => {
  const platform = g().platform;
  return callWorkerJSON(platform, `/counter/${counterId}`);
});
const incrementCounter = a("unchecked", async (counterId = "default") => {
  const platform = g().platform;
  const db = platform?.env?.DB;
  if (!db) {
    throw new Error("D1 database not available in platform environment");
  }
  const auth = c(db, platform?.env);
  const session = await auth.api.getSession({
    headers: g().request.headers
  });
  if (!session) throw new Error("Please sign in to increment the counter");
  return callWorkerJSON(platform, `/counter/${counterId}`, { method: "POST" });
});
for (const [name, fn] of Object.entries({ getCounter, incrementCounter })) {
  fn.__.id = "q5s0im/" + name;
  fn.__.name = name;
}
export {
  getCounter,
  incrementCounter
};
