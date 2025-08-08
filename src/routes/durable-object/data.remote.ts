import { query, command, getRequestEvent } from '$app/server';

// Remote functions to interact with the Counter Durable Object
export const getCounter = query('unchecked', async (counterId: string) => {
  const event = getRequestEvent();
  const platform = event.platform;

  console.log(event)
  
  console.log(`[SERVER] getCounter called for ID: ${counterId}`);
  console.log(`[SERVER] Platform available:`, !!platform);
  console.log(`[SERVER] Environment available:`, !!platform?.env);
  console.log(`[SERVER] COUNTER_DO binding available:`, !!(platform?.env as any)?.COUNTER_DO);
  console.log(`[SERVER] platform.env:`, platform?.env);

  if (!(platform?.env as any)?.COUNTER_DO) {
    throw new Error('COUNTER_DO Durable Object binding not available - try deploying with `alchemy deploy`');
  }
  
  try {
    // Get the Durable Object instance
    const id = (platform.env as any).COUNTER_DO.idFromName(counterId);
    const stub = (platform.env as any).COUNTER_DO.get(id);
    
    // Call the DO with a GET request
    const response = await stub.fetch(new Request('https://fake-host/'));
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
  
  if (!(platform?.env as any)?.COUNTER_DO) {
    throw new Error('COUNTER_DO Durable Object binding not available');
  }
  
  try {
    const id = (platform.env as any).COUNTER_DO.idFromName(counterId);
    const stub = (platform.env as any).COUNTER_DO.get(id);
    
    // Call the DO increment endpoint
    const response = await stub.fetch(new Request('https://fake-host/increment', {
      method: 'POST'
    }));
    const data = await response.json();
    
    console.log(`[SERVER] DO increment response:`, data);
    return data;
  } catch (error) {
    console.error('[SERVER] Error incrementing DO:', error);
    throw new Error(`Failed to increment counter: ${error}`);
  }
});