# barebones starter "remote" (sveltekit, better-auth, cloudflare d1/do, tailwind) utilizing remote functions

made a starter that lets you call server functions directly from components instead of writing api routes + fetch calls.

```typescript
// just call functions directly - works in ssr and csr
import { incrementCounter } from './data.remote.ts';
const count = await incrementCounter('user-123');
```

```typescript  
// data.remote.ts handles auth + environment switching automatically
export const incrementCounter = command('unchecked', async (counterId: string) => {
  const session = await auth.api.getSession({ headers: getRequestEvent().request.headers });
  if (!session) throw new Error('please sign in');
  
  // http calls in dev, service bindings in prod - no code changes
  return callWorkerJSON(platform, `/counter/${counterId}`, { method: 'POST' });
});
```

includes better auth + d1, durable objects for edge state, and deploys to cloudflare with zero config.

```bash
bun create remote-app my-app
bun run dev
```

repo: https://github.com/your-username/remote

to me this is close to the holy grail of what i want - sveltekit, a database, durable objects, and auth. i feel super enabled.

thoughts?
