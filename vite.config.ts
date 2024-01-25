import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	return {
		plugins: [sveltekit()],
		server: {
			host: env.VITE_HOST ?? '0.0.0.0',
			port: parseInt(env.VITE_PORT ?? '80'),
			https: false
		}
	};
});
