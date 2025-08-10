# Remote - SvelteKit + Better Auth + Durable Objects

Barebones starter for building authenticated apps with persistent state on the edge. No bullshit. Just working code.

## What This Shows

This project demonstrates:

- **SvelteKit Remote Functions**: Server-side functions that can be called directly from components, working in both SSR and CSR contexts
- **Better Auth Integration**: Full authentication system with sign up/sign in using Cloudflare D1 database
- **Cloudflare Durable Objects**: Persistent, globally consistent storage using an authenticated counter example
- **Alchemy Deployment**: Zero-configuration deployment to Cloudflare with automatic service bindings
- **Development Experience**: Local development with HTTP calls that automatically switch to service bindings in production

## Architecture

```
SvelteKit Component → Remote Function → Auth Check → Cloudflare Worker → Durable Object
                                    ↓
                              Better Auth + D1 Database
```

The key innovation is in `src/routes/data.remote.ts` where the same remote function works in both development and production:

- **Development**: HTTP calls to `localhost:1337`
- **Production**: Service bindings (no network latency)
- **Authentication**: Built-in auth checks for protected operations
- **No code changes** between environments

## Project Structure

```
src/
├── lib/
│   ├── auth.ts            # Better Auth configuration
│   ├── auth-client.ts     # Auth client setup
│   ├── auth-store.svelte.ts # Auth state management
│   └── schema.ts          # Database schema
├── routes/
│   ├── api/auth/[...all]/ # Better Auth API routes
│   ├── data.remote.ts     # Remote functions with auth checks
│   ├── +page.server.ts    # SSR load function
│   └── +page.svelte       # UI component
└── hooks.server.ts        # Server hooks for auth

worker/
└── index.ts               # Durable Object implementation + worker

alchemy.run.ts             # Deployment configuration
migrations/                # Database migrations for auth
```

## Setup

```bash
bun install
echo 'ALCHEMY_PASSWORD=your-password' > .env  # optional
bun run dev
```

Open http://localhost:5173 to see the authenticated counter interface.

## Key Implementation Details

### Remote Functions (`src/routes/data.remote.ts`)

```typescript
// Query function - no auth required
export const getCounter = query('unchecked', async (counterId: string = 'default') => {
  const platform = getRequestEvent().platform;
  return callWorkerJSON(platform, `/counter/${counterId}`);
});

// Command function - requires authentication
export const incrementCounter = command('unchecked', async (counterId: string = 'default') => {
  const platform = getRequestEvent().platform;
  
  const auth = createAuth(platform?.env?.DB, platform?.env);
  const session = await auth.api.getSession({ 
    headers: getRequestEvent().request.headers 
  });
  
  if (!session) throw new Error('Please sign in to increment the counter');
  
  return callWorkerJSON(platform, `/counter/${counterId}`, { method: 'POST' });
});
```

### Environment Switching

```typescript
function buildWorkerUrl(endpoint: string): string {
  return dev ? `http://localhost:1337${endpoint}` : `http://worker${endpoint}`;
}

async function callWorker(platform: App.Platform | undefined, endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = buildWorkerUrl(endpoint);
  if (dev) return fetch(url, options);
  const request = new Request(url, options);
  return platform!.env!.WORKER.fetch(request);
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



## Deployment

```bash
bun run deploy
```

Alchemy handles:
- D1 database creation and migrations
- Durable Object namespace creation  
- Worker deployment with bindings
- SvelteKit app deployment
- Service binding configuration

## Why This Pattern

Traditional approach requires manual API routes and fetch calls. This starter provides:
- **Direct function calls** from components
- **Automatic serialization** 
- **Type safety** end-to-end
- **Built-in authentication** with session management
- **Works in both SSR and CSR** contexts
- **Zero-config deployment** to Cloudflare edge

This is a pragmatic starting point for projects needing authenticated persistent edge state with SvelteKit.

## Scripts

- `bun run dev` - Development server
- `bun run deploy` - Deploy to Cloudflare
- `bun run destroy` - Remove infrastructure  
- `bun run build` - Build for production
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Drizzle Studio

## Requirements

- Node.js + Bun
- Cloudflare account (for deployment)