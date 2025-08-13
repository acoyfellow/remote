# test-local-template

Barebones SvelteKit + Better Auth + Durable Objects starter.

## Quick Start

```bash
# 1. Set your Alchemy password
echo 'ALCHEMY_PASSWORD=your-secure-password' > .env

# 2. Start development (migrations run automatically)
bun run dev
```

## What's Included

- **SvelteKit** with Svelte 5 and remote functions
- **Better Auth** with email/password authentication
- **Cloudflare D1** database (SQLite) for user data
- **Durable Objects** for persistent edge state
- **Alchemy** for zero-config deployment

## Project Structure

```
src/
├── lib/
│   ├── auth.ts              # Better Auth configuration
│   ├── auth-client.ts       # Auth client setup
│   ├── auth-store.svelte.ts # Auth state management
│   └── schema.ts            # Database schema
├── routes/
│   ├── api/auth/[...all]/   # Better Auth API routes
│   ├── data.remote.ts       # Your remote functions go here
│   └── +page.svelte         # Main page with auth demo
└── hooks.server.ts          # Server hooks for auth

worker/
└── index.ts                 # Your Durable Objects go here

alchemy.run.ts               # Deployment configuration
```

## Development Workflow

### 1. Customize Your Durable Object

Edit `worker/index.ts` and replace `MyDO` with your actual class:

```typescript
export class UserDataDO extends DurableObject {
  // Your persistent logic here
}
```

### 2. Update Alchemy Configuration

Edit `alchemy.run.ts` to match your Durable Object names:

```typescript
const USER_DATA_DO = DurableObjectNamespace(`${projectName}-user-data`, {
  className: "UserDataDO",
  scriptName: `${projectName}-worker`,
});
```

### 3. Add Remote Functions

Edit `src/routes/data.remote.ts` to add your server functions:

```typescript
export const getUserData = query('unchecked', async (userId: string) => {
  // Call your Durable Object
  return callWorkerJSON(platform, `/user/${userId}`);
});

export const updateUserData = command('unchecked', async (data: any) => {
  // Requires authentication
  if (!event.locals.session) throw new Error('Auth required');
  
  return callWorkerJSON(platform, '/user/update', {
    method: 'POST',
    body: JSON.stringify(data)
  });
});
```

### 4. Call From Components

Use your remote functions directly in Svelte components:

```svelte
<script>
  import { getUserData, updateUserData } from './data.remote';
  
  let userData = $state(null);
  
  async function loadData() {
    userData = await getUserData('user123');
  }
</script>
```

## Environment Variables

Required:
- `ALCHEMY_PASSWORD` - Your Alchemy deployment password
- `BETTER_AUTH_SECRET` - Auto-generated secure secret for auth

Optional:
- `BETTER_AUTH_URL` - Your app URL (defaults to localhost:5173)

## Scripts

- `bun run dev` - Start development server (runs migrations automatically)
- `bun run build` - Build for production
- `bun run deploy` - Deploy to Cloudflare
- `bun run db:studio` - Open Drizzle Studio (for local development)

## Deployment

```bash
# Deploy to Cloudflare
bun run deploy

# Destroy infrastructure
bun run destroy
```

Alchemy handles:
- D1 database creation and migrations
- Durable Object namespace setup
- Worker deployment with bindings
- SvelteKit app deployment
- Service binding configuration

## Next Steps

1. **Design your data model** - What will your Durable Objects store?
2. **Add remote functions** - What server operations do you need?
3. **Build your UI** - Replace the demo auth page with your app
4. **Deploy** - Push to production with `bun run deploy`

## Architecture

```
SvelteKit Component → Remote Function → Auth Check → Cloudflare Worker → Durable Object
                                    ↓
                              Better Auth + D1 Database
```

The key innovation is that remote functions work seamlessly in both development and production:
- **Development**: HTTP calls to `localhost:1337`
- **Production**: Service bindings (no network latency)
- **No code changes** between environments

## Resources

- [SvelteKit Docs](https://kit.svelte.dev/)
- [Better Auth Docs](https://www.better-auth.com/)
- [Durable Objects Docs](https://developers.cloudflare.com/durable-objects/)
- [Alchemy Docs](https://alchemy.run/)
