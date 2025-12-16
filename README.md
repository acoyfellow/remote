# Remote - SvelteKit + Better Auth + Durable Objects

Barebones starter for building authenticated apps with persistent state on the edge.

## Quick Start

Create a new project with the CLI:

```bash
# npm
npm create remote-app my-app

# bun (recommended)  
bun create remote-app my-app

# npx
npx create-remote-app my-app
```

Then follow the setup guide in your new project's README.

## What This Repo Shows

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

## CLI Tool

This repo includes a CLI tool for creating new projects:

```bash
npm create remote-app my-app
```

The CLI creates a barebones starter (without the counter demo) that includes:
- Working authentication with Better Auth
- Template Durable Objects with setup guides
- Example remote functions with auth patterns
- Complete deployment configuration
- Detailed setup documentation

## Demo Setup (This Repo)

To run this demo repo locally:

```bash
bun install
echo 'ALCHEMY_PASSWORD=your-password' > .env
echo 'BETTER_AUTH_SECRET=your-secret-key-here' >> .env
bun run dev  # Alchemy handles migrations automatically
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

### Manual Deployment
```bash
bun run deploy
```

### Automatic CI/CD
Push to `main` branch triggers automatic deployment via GitHub Actions:
- **Main branch**: Deploys to production
- **Pull requests**: Creates preview deployments  
- **PR closure**: Automatically cleans up preview infrastructure

Configure these secrets in your GitHub repository:
- `ALCHEMY_PASSWORD`
- `BETTER_AUTH_SECRET` (required - generate a secure random string)
- `BETTER_AUTH_URL` 
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_KEY`
- `CLOUDFLARE_EMAIL`

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

## Getting Started

1. **Create a new project**: `npm create remote-app my-app`
2. **Set your ALCHEMY_PASSWORD** in `.env`
3. **Start developing**: `bun run dev` (Alchemy handles migrations automatically)
4. **Deploy**: `bun run deploy`

## Scripts

- `bun run dev` - Development server (runs migrations automatically)
- `bun run deploy` - Deploy to Cloudflare
- `bun run destroy` - Remove infrastructure  
- `bun run build` - Build for production
- `bun run db:studio` - Open Drizzle Studio (for local development)

## Requirements

- Node.js + Bun
- Cloudflare account (for deployment)