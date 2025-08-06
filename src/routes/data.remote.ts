
import { query, command, getRequestEvent } from '$app/server';

/* 
fun questions..
- can we use the same function for both client and server?
- can i use durable object bindings from here?
- websockets?
*/

// Test 1: Basic hello world
export const getHello = query(async () => {
  console.log('[SERVER] getHello called');
  return 'Hello, world!';
});

// Test 2: Can we access Cloudflare bindings? (Durable Objects, KV, etc.)
export const testBindings = query(async () => {
  const event = getRequestEvent();
  const platform = event.platform;
  
  // Check if we have access to Cloudflare bindings
  const bindings = {
    hasEnv: !!platform?.env,
    envKeys: platform?.env ? Object.keys(platform.env) : [],
    // Try to access common Cloudflare bindings
    hasKV: !!(platform?.env as any)?.KV,
    hasDO: !!(platform?.env as any)?.DURABLE_OBJECT,
    hasR2: !!(platform?.env as any)?.R2,
  };
  
  return bindings;
});

// Test 3: Can we use the same function logic on both client and server?
const sharedLogic = (name: string) => {
  return `Processed: ${name.toUpperCase()} at ${new Date().toISOString()}`;
};

export const testSharedLogic = query('unchecked', async (name: string) => {
  console.log(`[SERVER] testSharedLogic called with name: ${name}`);
  // This runs on server
  const serverResult = sharedLogic(name || 'server');
  
  return {
    serverResult,
    timestamp: Date.now(),
    environment: 'server'
  };
});

// Test 4: WebSocket-like real-time data simulation
export const getRealtimeData = query(async () => {
  console.log('[SERVER] getRealtimeData called');
  // Simulate real-time data that changes
  return {
    timestamp: Date.now(),
    randomValue: Math.random(),
    serverTime: new Date().toISOString(),
    uptime: process.uptime?.() || 'unknown'
  };
});

// Test 5: Command to test if we can modify server state
let serverCounter = 0;
export const incrementCounter = command(async () => {
  console.log(`[SERVER] incrementCounter called, current value: ${serverCounter}`);
  serverCounter++;
  console.log(`[SERVER] Counter incremented to: ${serverCounter}`);
  
  return { 
    counter: serverCounter,
    message: `Counter incremented to ${serverCounter}` 
  };
});

export const getCounter = query(async () => {
  console.log(`[SERVER] getCounter called, returning: ${serverCounter}`);
  return { counter: serverCounter };
});
