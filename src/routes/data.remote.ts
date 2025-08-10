import { query, command, getRequestEvent } from '$app/server';
import { dev } from '$app/environment';

type CounterData = { count: number; id: string; timestamp: string };

function buildWorkerUrl(endpoint: string): string {
  return dev ? `http://localhost:1337${endpoint}` : `http://worker${endpoint}`;
}

async function callWorker(
  platform: App.Platform | undefined,
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = buildWorkerUrl(endpoint);
  if (dev) return fetch(url, options);
  const request = new Request(url, options);
  return platform!.env!.WORKER.fetch(request);
}

async function callWorkerJSON<T>(
  platform: App.Platform | undefined,
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await callWorker(platform, endpoint, options);
  if (!res.ok) throw new Error(`Worker ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

// Remote functions to interact with the Counter Durable Object
export const getCounter = query('unchecked', async (counterId: string = 'default'): Promise<CounterData> => {
  const platform = getRequestEvent().platform;
  return callWorkerJSON(platform, `/counter/${counterId}`);
});

export const incrementCounter = command('unchecked', async (counterId: string = 'default'): Promise<CounterData> => {
  const platform = getRequestEvent().platform;
  const event = getRequestEvent();
  
  // Use session already validated in hooks.server.ts (no duplicate DB call)
  if (!event.locals.session) {
    throw new Error('Please sign in to increment the counter');
  }
  
  return callWorkerJSON(platform, `/counter/${counterId}`, { method: 'POST' });
});
