import { query, command, getRequestEvent } from '$app/server';
import { dev } from '$app/environment';

type CounterData = { 
  count: number; 
  id: string; 
  timestamp: string;
  timing?: {
    backend: number;
    worker?: number;
    durableObject?: number;
  };
};

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
  try {
    const res = await callWorker(platform, endpoint, options);
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Service error');
      
      // Parse JSON error if available
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || `Service error (${res.status})`);
      } catch {
        throw new Error(`Service error (${res.status}): ${errorText}`);
      }
    }
    return res.json() as Promise<T>;
  } catch (error) {
    // Graceful fallback for network/worker failures
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Service temporarily unavailable. Please try again.');
    }
    throw error;
  }
}

// Remote functions to interact with the Counter Durable Object
export const getCounter = query('unchecked', async (counterId: string = 'default'): Promise<CounterData> => {
  const backendStart = performance.now();
  try {
    const platform = getRequestEvent().platform;
    const workerStart = performance.now();
    const result = await callWorkerJSON<CounterData>(platform, `/counter/${counterId}`);
    const workerEnd = performance.now();
    const backendEnd = performance.now();
    
    return {
      ...result,
      timing: {
        backend: backendEnd - backendStart,
        worker: workerEnd - workerStart,
        durableObject: result.timing?.durableObject
      }
    };
  } catch (err) {
    console.error('Failed to get counter:', err);
    const backendEnd = performance.now();
    return {
      count: 0,
      id: counterId,
      timestamp: new Date().toISOString(),
      timing: {
        backend: backendEnd - backendStart
      }
    } as CounterData;
  }
});

export const incrementCounter = command('unchecked', async (counterId: string = 'default'): Promise<CounterData> => {
  const backendStart = performance.now();
  const platform = getRequestEvent().platform;
  const event = getRequestEvent();
  
  if (!event.locals.session) {
    throw new Error('Please sign in to increment the counter');
  }
  
  try {
    const workerStart = performance.now();
    const result = await callWorkerJSON<CounterData>(platform, `/counter/${counterId}`, { method: 'POST' });
    const workerEnd = performance.now();
    const backendEnd = performance.now();
    
    return {
      ...result,
      timing: {
        backend: backendEnd - backendStart,
        worker: workerEnd - workerStart,
        durableObject: result.timing?.durableObject
      }
    };
  } catch (err) {
    console.error('Failed to increment counter:', err);
    
    // Provide specific error messages based on error type
    if (err instanceof Error) {
      if (err.message.includes('Invalid counter ID')) {
        throw new Error('Invalid counter name. Use only letters, numbers, and dashes.');
      }
      if (err.message.includes('Service error (400)')) {
        throw new Error('Invalid request. Please check your input.');
      }
      if (err.message.includes('Service error (503)')) {
        throw new Error('Counter service is temporarily down. Please try again in a moment.');
      }
    }
    
    throw new Error('Unable to increment counter. Please try again.');
  }
});
