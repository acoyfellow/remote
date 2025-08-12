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
- **Alchemy** for zero-config deployment

## Quick Start

```bash
npm create remote-app my-app
cd my-app

# Set your Alchemy password
echo 'ALCHEMY_PASSWORD=your-secure-password' > .env

# Run database migrations
bun run db:migrate

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

## Repository

Part of the [remote](https://github.com/acoyfellow/remote) project.
