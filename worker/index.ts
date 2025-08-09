import { DurableObject } from 'cloudflare:workers'

type Env = {
  COUNTER_DO: DurableObjectNamespace<CounterDO>
}

export class CounterDO extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    console.log("CounterDO fetch", request);
    
    // Get current count from storage
    const count = await this.ctx.storage.get<number>('count') || 0;
    
    const url = new URL(request.url);
    
    if (request.method === 'GET') {
      return Response.json({
        count: count,
        id: this.ctx.id.toString(),
        timestamp: new Date().toISOString()
      });
    }

    if (request.method === 'POST') {
      const newCount = count + 1;
      await this.ctx.storage.put('count', newCount);
      
      return Response.json({
        count: newCount,
        id: this.ctx.id.toString(),
        timestamp: new Date().toISOString()
      });
    }

    return new Response('Not found', { status: 404 });
  }
}

export default {
  async fetch(request: Request, env: Env) {
    console.log("Worker fetch", request.url);
    
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle counter requests: /counter/{counterId}
    if (pathname.startsWith('/counter/')) {
      const pathParts = pathname.split('/');
      const counterId = pathParts[2] || 'default';
      
      const id = env.COUNTER_DO.idFromName(counterId);
      const counter = env.COUNTER_DO.get(id);
      const resp = await counter.fetch(request);
      console.log("CounterDO fetch", resp);
      return resp;
    }

    return new Response("Not found", { status: 404 });
  }
};