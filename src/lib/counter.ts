import type { website } from "../../alchemy.run";

// Durable Object implementation based on Alchemy guide
export class Counter {
  declare env: typeof website.Env;
  private state: DurableObjectState;
  private count: number = 0;

  constructor(state: DurableObjectState, env: typeof website.Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Retrieve current count from storage
    this.count = (await this.state.storage.get("count")) || 0;

    console.log(`[DO] Counter ${this.state.id.toString()} - ${path} - current count: ${this.count}`);

    if (path === "/increment") {
      this.count++;
      await this.state.storage.put("count", this.count);
      console.log(`[DO] Incremented to: ${this.count}`);
    } else if (path === "/decrement") {
      this.count--;
      await this.state.storage.put("count", this.count);
      console.log(`[DO] Decremented to: ${this.count}`);
    } else if (path === "/reset") {
      this.count = 0;
      await this.state.storage.put("count", this.count);
      console.log(`[DO] Reset to: ${this.count}`);
    } else if (path === "/add") {
      // Handle POST with JSON body for custom increments
      if (request.method === "POST") {
        try {
          const body = await request.json() as { amount: number };
          this.count += body.amount || 1;
          await this.state.storage.put("count", this.count);
          console.log(`[DO] Added ${body.amount} to get: ${this.count}`);
        } catch (e) {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }
      }
    }

    // Return current state
    return Response.json({ 
      count: this.count,
      id: this.state.id.toString(),
      timestamp: Date.now()
    });
  }
}