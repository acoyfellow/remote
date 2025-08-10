import { DurableObject } from 'cloudflare:workers'

type Env = {
  COUNTER_DO: DurableObjectNamespace<CounterDO>
}

export class CounterDO extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const durableObjectStart = performance.now();
    
    try {
      // Keep DO warm with periodic alarms
      await this.ensureKeepAlive();
      
      // Get current count from storage
      const storageStart = performance.now();
      const count = await this.ctx.storage.get<number>('count') || 0;
      const storageEnd = performance.now();
      
      if (request.method === 'GET') {
        const durableObjectEnd = performance.now();
        return Response.json({
          count: count,
          id: this.ctx.id.toString(),
          timestamp: new Date().toISOString(),
          timing: {
            durableObject: durableObjectEnd - durableObjectStart,
            storage: storageEnd - storageStart
          }
        });
      }

      if (request.method === 'POST') {
        const writeStart = performance.now();
        const newCount = count + 1;
        await this.ctx.storage.put('count', newCount);
        const writeEnd = performance.now();
        const durableObjectEnd = performance.now();
        
        return Response.json({
          count: newCount,
          id: this.ctx.id.toString(),
          timestamp: new Date().toISOString(),
          timing: {
            durableObject: durableObjectEnd - durableObjectStart,
            storage: storageEnd - storageStart,
            write: writeEnd - writeStart
          }
        });
      }

      return new Response('Not found', { status: 404 });
      
    } catch (error) {
      console.error('Durable Object error:', error);
      return new Response(
        JSON.stringify({ error: 'Storage temporarily unavailable' }), 
        { 
          status: 503, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  }

  // Keep-alive mechanism using alarms
  private async ensureKeepAlive() {
    const currentAlarm = await this.ctx.storage.getAlarm();
    if (currentAlarm === null) {
      // Set alarm for 30 seconds from now to keep DO warm
      await this.ctx.storage.setAlarm(Date.now() + 30 * 1000);
    }
  }

  // Alarm handler - just reschedule to stay warm
  async alarm() {
    // Reschedule next keep-alive
    await this.ctx.storage.setAlarm(Date.now() + 30 * 1000);
  }
}

export default {
  async fetch(request: Request, env: Env) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Handle counter requests: /counter/{counterId}
      if (pathname.startsWith('/counter/')) {
        const pathParts = pathname.split('/');
        const counterId = pathParts[2] || 'default';
        
        if (!counterId || counterId.length > 50) {
          return new Response('Invalid counter ID', { status: 400 });
        }

        const id = env.COUNTER_DO.idFromName(counterId);
        const counter = env.COUNTER_DO.get(id);
        return await counter.fetch(request);
      }

      return new Response("Not found", { status: 404 });
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }), 
        { 
          status: 503, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  }
};