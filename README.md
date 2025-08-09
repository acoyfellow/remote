### Remote Functions + Durable Objects on Cloudflare (SvelteKit + Alchemy)

An example project showcasing SvelteKit remote functions calling into a Cloudflare Worker with Durable Objects, wired up with Alchemy for a great DX.

- SvelteKit 2 + Svelte 5
- Cloudflare Worker with a `DurableObject` counter
- Remote functions that call the Worker (dev via localhost, prod via service binding)
- One-command dev and deploy via Alchemy

### Quickstart

1) Install deps

```sh
npm install
```

2) Create `.env` (see `.env.example`)

```sh
cp .env.example .env
```

3) Start dev

```sh
npm run dev
```

This will:
- run SvelteKit dev
- run the Worker locally and bind it so remote functions can call it

Open the app, then visit:
- `/` for the remote functions lab
- `/durable-object` for the DO counter demo

### Deploy

```sh
npm run deploy
```

Alchemy will provision the Worker and the site, bind the Durable Object, and set service bindings so production remote functions can call the Worker.

### How it works

- `worker/index.ts` defines a `CounterDO` Durable Object and routes `/counter/:id` requests to it
- `alchemy.run.ts` creates the Worker and the Website, binds `COUNTER_DO` and exposes the Worker to the site as `WORKER`
- `src/routes/durable-object/data.remote.ts` contains two server-side remote functions that call the Worker

Key bit that enables prod calls from remote functions:

```ts
// alchemy.run.ts (website bindings)
bindings: {
  COUNTER_DO,
  WORKER: worker
}
```

Dev calls go to `http://localhost:1337`, prod calls use the `WORKER` service binding.

### Scripts

- `dev`: run the website and worker locally via Alchemy
- `build`: vite build for the website
- `preview`: vite preview
- `deploy`: deploy via Alchemy
- `destroy`: tear down via Alchemy
- `check`: type-check via svelte-check

### Environment

See `.env.example`. The only required variable is `ALCHEMY_PASSWORD` for local dev auth; `ALCHEMY_STAGE` defaults to `dev`.

### License

MIT — see `LICENSE`.
