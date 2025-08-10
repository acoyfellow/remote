import alchemy from 'alchemy/cloudflare/sveltekit';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: { 
		adapter: alchemy(),
    // adapter: adapter({
		// 	platformProxy: {
		// 		persist: { path: ".alchemy/miniflare/v3" }
		// 	}
		// }),
    experimental: {
			remoteFunctions: true
		}
  },
  compilerOptions: {
		experimental: {
			async: true
		}
	},
  alias: {
    $shared: 'shared'
  }
};

export default config;
