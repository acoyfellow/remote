# SvelteKit Remote Functions with Cloudflare Durable Objects

A demonstration of SvelteKit's remote functions feature working with Cloudflare Durable Objects via Alchemy for deployment.

## What This Shows

This project demonstrates:

- **SvelteKit Remote Functions**: Server-side functions that can be called directly from components, working in both SSR and CSR contexts
- **Cloudflare Durable Objects**: Persistent, globally consistent storage using a simple counter example
- **Alchemy Deployment**: Zero-configuration deployment to Cloudflare with automatic service bindings
- **Development Experience**: Local development with HTTP calls that automatically switch to service bindings in production

## Architecture

```
SvelteKit Component → Remote Function → Cloudflare Worker → Durable Object
```

The key innovation is in `src/routes/data.remote.ts` where the same remote function works in both development and production:

- **Development**: HTTP calls to `localhost:1337`
- **Production**: Service bindings (no network latency)
- **No code changes** between environments

## Project Structure

```
src/routes/
├── data.remote.ts          # Remote functions that call the worker
├── +page.server.ts         # SSR load function
└── +page.svelte           # UI component

worker/
└── index.ts               # Durable Object implementation + worker

alchemy.run.ts             # Deployment configuration
```

## Setup

```bash
npm install
echo 'ALCHEMY_PASSWORD=your-password' > .env  # optional
npm run dev
```

Open http://localhost:5173 to see the counter interface.

## Key Implementation Details

### Remote Functions (`src/routes/data.remote.ts`)

```typescript
export const getCounter = query('unchecked', async (counterId: string) => {
  const platform = getRequestEvent().platform;
  const response = await workerRequest(platform, `/counter/${counterId}`);
  return response.json();
});
```

### Environment Switching (worker call helper)

```typescript
function buildWorkerUrl(endpoint: string) {
  return dev ? `http://localhost:1337${endpoint}` : `http://worker${endpoint}`;
}

async function callWorker(platform: App.Platform | undefined, endpoint: string, options?: RequestInit) {
  const url = buildWorkerUrl(endpoint);
  if (dev) return fetch(url, options);
  return platform!.env!.WORKER.fetch(new Request(url, options));
}

async function callWorkerJSON<T>(platform: App.Platform | undefined, endpoint: string, options?: RequestInit): Promise<T> {
  const res = await callWorker(platform, endpoint, options);
  if (!res.ok) throw new Error(`Worker ${res.status}: ${await res.text()}`);
  return res.json();
}
```

### Durable Object (`worker/index.ts`)

Basic counter with persistent storage:

```typescript
export class CounterDO extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const count = (await this.ctx.storage.get<number>('count')) || 0;
    if (request.method === 'POST') {
      const newCount = count + 1;
      await this.ctx.storage.put('count', newCount);
      return Response.json({ count: newCount, id: this.ctx.id.toString(), timestamp: new Date().toISOString() });
    }
    return Response.json({ count, id: this.ctx.id.toString(), timestamp: new Date().toISOString() });
  }
}
```

### Remote Functions (`src/routes/data.remote.ts`)

```typescript
export const getCounter = query('unchecked', async (counterId = 'default') => {
  const platform = getRequestEvent().platform;
  return callWorkerJSON(platform, `/counter/${counterId}`);
});

// Mutations use command; same endpoint, POST increments
export const incrementCounter = command('unchecked', async (counterId = 'default') => {
  const platform = getRequestEvent().platform;
  return callWorkerJSON(platform, `/counter/${counterId}`, { method: 'POST' });
});
```

## Deployment

```bash
npm run deploy
```

Alchemy handles:
- Durable Object namespace creation
- Worker deployment with bindings
- SvelteKit app deployment
- Service binding configuration

## Why This Pattern

Traditional approach requires manual API routes and fetch calls. Remote functions provide:
- Direct function calls from components
- Automatic serialization
- Type safety end-to-end
- Works in both SSR and CSR contexts

This is a good starting point for projects needing persistent edge state with SvelteKit.

## Scripts

- `npm run dev` - Development server
- `npm run deploy` - Deploy to Cloudflare
- `npm run destroy` - Remove infrastructure
- `npm run build` - Build for production

## Requirements

- Node.js
- Cloudflare account (for deployment)