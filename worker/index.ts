import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  COUNTER_DO: DurableObjectNamespace;
}

export class CounterDO {
  private count: number = 0;
  private initialized = false;

  constructor(private state: DurableObjectState, private env: Env) {}

  async fetch(request: Request): Promise<Response> {
    // Initialize count from storage on first request
    if (!this.initialized) {
      const stored = await this.state.storage.get<number>('count');
      this.count = stored || 0;
      this.initialized = true;
    }

    const url = new URL(request.url);
    
    if (request.method === 'GET' && url.pathname === '/') {
      return Response.json({
        count: this.count,
        id: this.state.id.toString(),
        timestamp: new Date().toISOString()
      });
    }

    if (request.method === 'POST' && url.pathname === '/increment') {
      this.count++;
      await this.state.storage.put('count', this.count);
      
      return Response.json({
        count: this.count,
        id: this.state.id.toString(),
        timestamp: new Date().toISOString()
      });
    }

    return new Response('Not found', { status: 404 });
  }
}

// Main worker
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return new Response('Worker running');
  }
};