import alchemy from 'alchemy/cloudflare/sveltekit';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: { 
		adapter: alchemy(),
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
