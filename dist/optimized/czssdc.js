import { g } from "../chunks/event.js";
import { q, a } from "../chunks/query.js";
import "@sveltejs/kit";
import "../chunks/event-state.js";
import "../chunks/false.js";
import "../chunks/paths.js";
async function workerRequest(platform, endpoint, options = {}) {
  {
    const url = `http://worker${endpoint}`;
    console.log("🌐 Prod: Using service binding for", url);
    const request = new Request(url, options);
    return await platform.env.WORKER.fetch(request);
  }
}
const getCounter = q("unchecked", async (counterId) => {
  const event = g();
  const platform = event.platform;
  try {
    const response = await workerRequest(platform, `/counter/${counterId}`);
    const data = await response.json();
    console.log(`[SERVER] DO response:`, data);
    return data;
  } catch (error) {
    console.error("[SERVER] Error calling DO:", error);
    throw new Error(`Failed to get counter: ${error}`);
  }
});
const incrementCounter = a("unchecked", async (counterId) => {
  const event = g();
  const platform = event.platform;
  console.log(`[SERVER] incrementCounter called for ID: ${counterId}`);
  try {
    const response = await workerRequest(platform, `/counter/${counterId}/increment`, {
      method: "POST"
    });
    const data = await response.json();
    console.log(`[SERVER] DO increment response:`, data);
    return data;
  } catch (error) {
    console.error("[SERVER] Error incrementing DO:", error);
    throw new Error(`Failed to increment counter: ${error}`);
  }
});
for (const [name, fn] of Object.entries({ getCounter, incrementCounter })) {
  fn.__.id = "czssdc/" + name;
  fn.__.name = name;
}
export {
  getCounter,
  incrementCounter
};
