# create-remote-app

Create a new SvelteKit + Better Auth + Durable Objects app.

## Usage

```bash
# npm
npm create remote-app my-app

# bun  
bun create remote-app my-app

# npx
npx create-remote-app my-app
```

## What You Get

A barebones starter with:

- **SvelteKit** with Svelte 5 and remote functions
- **Better Auth** with email/password authentication  
- **Cloudflare D1** database for user data
- **Durable Objects** for persistent edge state
- **Alchemy** for zero-config dev & deployment

## Quick Start

```bash
npm create remote-app my-app
cd my-app

# Set your Alchemy password
echo 'ALCHEMY_PASSWORD=your-secure-password' > .env

# Start development
bun run dev
```

## Features

- Interactive CLI with prompts for project setup
- Auto-generated secure auth secrets
- Template Durable Objects with TODO guides
- Example remote functions with auth patterns
- Complete deployment configuration
- Detailed setup documentation

## Troubleshooting

If you're getting an old template version:

```bash
# Clear package manager cache
bun pm cache rm
# or
npm cache clean --force

# Then retry
bun create remote-app my-app
```

## Repository

Part of the [remote](https://github.com/acoyfellow/remote) project.
