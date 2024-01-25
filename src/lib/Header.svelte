<script lang="ts">
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { beforeUpdate } from 'svelte';
	// import ThemeSwitcher from './ThemeSwitcher.svelte';

	export let isRootRoute: boolean;
</script>

<div class="flex justify-between py-2 md:py-6 px-4 lg:px-12 {isRootRoute ? "": "bg-white"}">
	<a href="/" class="text-black dark:text-slate-200 flex space-x-4 items-center {isRootRoute ? "animate-logo": ""}">
		<img class="h-[2.2rem]" src="/logo.png" alt="SlickGPT Logo" />
	</a>
	<div class="absolute top-12 left-[25rem] w-0 h-2 bg-[#5078ea] {isRootRoute ? "slide": ""}"></div>
</div>

<style lang="postcss">
	@keyframes slide {
    0% { width: 0; left: 25rem; }
		15% { width: 3.5rem; left: 23rem; }
    30% { width: 7rem; left: 25rem; }
    100% { width: 7rem; left: 100%; }
	}
	.slide {
		animation: slide 3s ease-out;
	}

	@keyframes logo {
    0% { opacity: 0; }
    100% { opacity: 1; }
	}
	.animate-logo {
		opacity: 0;
		animation: logo 0.5s 3s ease-out forwards;
	}
</style>
