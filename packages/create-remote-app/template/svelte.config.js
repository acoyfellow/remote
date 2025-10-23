import alchemy from 'alchemy/cloudflare/sveltekit';
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: { 
		adapter: dev ? alchemy() : adapter(),
    experimental: {
			remoteFunctions: true
		} 
  },
  compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
