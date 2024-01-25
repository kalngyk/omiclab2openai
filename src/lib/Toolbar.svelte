<script lang="ts">
	import { showModalComponent } from '$misc/shared';
	import { createEventDispatcher } from 'svelte';
	import { PencilSquare, XMark } from '@inqling/svelte-icons/heroicon-24-solid';
	import { getModalStore } from '@skeletonlabs/skeleton';

	const dispatch = createEventDispatcher();
	const modalStore = getModalStore();

	export let title: string;
	export let slug = '';

	function handleEditTitle() {
		if (slug) {
			showModalComponent(modalStore, 'SuggestTitleModal', { slug });
		}
	}
</script>

<header class="sticky top-0 z-10 badge-glass py-2 md:px-8 bg-[#5a74f9]" style="border-radius: 1.75rem;">
	<div class="flex flex-col-reverse md:flex-row justify-center md:justify-between items-center">
		<!-- Title -->
		<div class="flex justify-center md:justify-start w-full px-4 md:px-0 mt-4 md:mt-0 max-w-[80%]">
			<h2 class="h2 truncate text-base md:text-2xl font-bold text-white">
				{title}
			</h2>
		</div>

		<div class="flex justify-self-center space-x-4">
			<!-- Provided by using components -->
			<slot name="actions" />

			<!-- Close -->
			<button class="toolbtn bg-black" on:click={() => dispatch('closeChat')}>
				<svg class="icon w-6 h-6" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
					<path d="M1023.997 114.97 911.408 2.388 516.149 397.629 118.5 0 5.91 112.585l397.649 397.629L7.107 906.648l112.587 112.59 396.454-396.439 395.259 395.249 112.59-112.59L628.738 510.214 1023.997 114.97z" fill="#ffffff"></path>
				</svg>
			</button>
		</div>
	</div>
</header>

<style lang="postcss">
	.toolbtn {
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 1.75rem;
	}
</style>
