import { query, command, getRequestEvent } from '$app/server';
import { dev } from '$app/environment';

// Reusable helper for making requests to the worker
async function workerRequest(platform: any, endpoint: string, options: RequestInit = {}) {
  if (dev) {
    // In development, use HTTP fetch to localhost
    const url = `http://localhost:1337${endpoint}`;
    console.log('🌐 Dev: Calling', url);
    return await fetch(url, options);
  } else {
    // In production, use service binding to avoid error code 1042
    const url = `http://worker${endpoint}`;
    console.log('🌐 Prod: Using service binding for', url);
    const request = new Request(url, options);
    return await platform!.env!.WORKER.fetch(request);
  }
}

// Remote functions to interact with the Counter Durable Object
export const getCounter = query('unchecked', async (counterId: string) => {
  const event = getRequestEvent();
  const platform = event.platform;

  try {
    // Call the worker with counter ID in path, let DO handle GET request
    const response = await workerRequest(platform, `/counter/${counterId}`);
    const data = await response.json();
    
    console.log(`[SERVER] DO response:`, data);
    return data;
  } catch (error) {
    console.error('[SERVER] Error calling DO:', error);
    throw new Error(`Failed to get counter: ${error}`);
  }
});

export const incrementCounter = command('unchecked', async (counterId: string) => {
  const event = getRequestEvent();
  const platform = event.platform;
  
  console.log(`[SERVER] incrementCounter called for ID: ${counterId}`);
  
  try {
    // Call the worker with counter ID in path and /increment, let DO handle POST
    const response = await workerRequest(platform, `/counter/${counterId}/increment`, {
      method: 'POST'
    });
    const data = await response.json();
    
    console.log(`[SERVER] DO increment response:`, data);
    return data;
  } catch (error) {
    console.error('[SERVER] Error incrementing DO:', error);
    throw new Error(`Failed to increment counter: ${error}`);
  }
});
