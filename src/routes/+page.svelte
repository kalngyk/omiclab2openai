<script lang="ts">
	import { onMount } from 'svelte';
	import TimeAgo from 'javascript-time-ago';
	import en from 'javascript-time-ago/locale/en';
	import { getModalStore, getToastStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import {
		PlusCircle,
		ChatBubbleLeftRight,
		Share,
		Trash
	} from '@inqling/svelte-icons/heroicon-24-solid';
	import {
		ChatBubbleBottomCenter,
		AcademicCap,
		Clock
	} from '@inqling/svelte-icons/heroicon-24-outline';
	import { goto } from '$app/navigation';
	import { createNewChat, showToast } from '$misc/shared';
	import { chatStore, isTimeagoInitializedStore } from '$misc/stores';
	import { fly } from 'svelte/transition';
	import Header from '$lib/Header.svelte';

	const modalStore = getModalStore();
	const toastStore = getToastStore();

	let timeAgo: TimeAgo;

	$: sortedChats = Object.entries($chatStore).sort((a, b) => {
		return new Date(b[1].created).getTime() - new Date(a[1].created).getTime();
	});

	onMount(() => {
		if (!$isTimeagoInitializedStore) {
			// logs annoying console error if called more than once
			TimeAgo.addDefaultLocale(en);
			$isTimeagoInitializedStore = true;
		}
		timeAgo = new TimeAgo('en-US');
	});

	async function modalConfirmDelete() {
		const modal: ModalSettings = {
			type: 'confirm',
			title: 'Please confirm',
			body: 'Are you sure you want to delete all chats? This will also unshare them.',
			response: (result: boolean) => {
				if (result) {
					// not awaitable here but doesn't matter because we don't really care about the toast.
					// 'await' expressions are only allowed within async functions and at the top levels of modules.ts(1308)
					clearStorage();
				}
			}
		};
		modalStore.trigger(modal);
	}

	async function clearStorage() {
		const docsToDelete: { [key: string]: string } = {};
		let savedChatsAmount = 0;
		for (const [slug, chat] of Object.entries($chatStore)) {
			if (chat.updateToken?.length) {
				docsToDelete[slug] = chat.updateToken;
			}
			savedChatsAmount++;
		}

		const response = await fetch('/api/share', {
			method: 'DELETE',
			body: JSON.stringify(docsToDelete)
		});
		const { deleted: unshared }: { deleted: string[] } = await response.json();

		let message = `${savedChatsAmount} ${savedChatsAmount === 1 ? 'chat' : 'chats'} deleted.`;
		if (unshared?.length) {
			message += ` ${unshared.length} ${unshared.length === 1 ? 'chat' : 'chats'} unshared.`;
		}

		showToast(toastStore, message);

		// update the local store
		$chatStore = {};

		goto('/');
	}
</script>

<Header isRootRoute={true}/>
<div>
	<div class="relative text-white italic text-center text animate-text">
		<div class="word">G</div>
		<div class="word">e</div>
		<div class="word">t</div>
		<div style="display: inline-block;">&nbsp;</div>
		<div class="word">S</div>
		<div class="word">t</div>
		<div class="word">a</div>
		<div class="word">r</div>
		<div class="word">t</div>
		<div class="word">e</div>
		<div class="word">d</div>
		<div class="absolute flex">
			<div class="word">S</div>
			<div class="word">l</div>
			<div class="word">i</div>
			<div class="word">c</div>
			<div class="word">k</div>
			<div class="word">G</div>
			<div class="word">P</div>
			<div class="word">T</div>
		</div>
	</div>
	<div class="flex justify-center gap-8 animate-actions font-bold">
		<!-- Add button -->
		<button class="card p-2 bg-[white]" on:click={() => createNewChat()}>
			<div class="flex space-x-2 md:space-x-4 items-center self-center justify-self-center">
				<PlusCircle class="w-10 h-10" fill="#e5e7eb" />
				<span class="relative top-[-2px] text-xl">新建对话</span>
			</div>
		</button>
	
		<!-- Discord -->
		<a
			class="card p-2 bg-[white]"
			href="https://discord.gg/k8tTBar3gZ"
			target="_blank"
		>
			<div class="flex space-x-2 md:space-x-4 items-center self-center justify-self-center">
				<PlusCircle class="w-10 h-10" fill="#e5e7eb" />
				<span class="relative top-[-2px] text-xl">加入我们的社区</span>
			</div>
		</a>
	
		<!-- Patreon -->
		<a
			class="card p-2 bg-[black]"
			href="https://patreon.com/ShipBit?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=creatorshare_creator&utm_content=join_link"
			target="_blank"
		>
			<div class="flex items-center justify-center h-full">
				<span class="relative top-[-2px] text-xl text-white">支持我们</span>
			</div>
		</a>
	</div>
	<div class="absolute bottom-4 w-full text-white text-center z-10">copyright @2023 ByoRyn Shenzhen, All right reserved</div>
	<div class="absolute bottom-0 w-full animate-svg">
		<svg width="100%" viewBox="100 0 260 50" height="100" preserveAspectRatio="none">
			<defs>
				<path id="wave" d="M0 0c22.863 0 40.637 25.93 63.5 25.93S104.137 0 127 0s40.637 25.93 63.5 25.93S231.137 0 254 0s40.637 25.93 63.5 25.93S358.137 0 381 0s40.637 25.93 63.5 25.93S485.137 0 508 0s40.637 25.93 63.5 25.93S612.137 0 635 0s40.637 25.93 63.5 25.93S739.137 0 762 0v52.917H0z" />
			</defs>
			<use class="wave" xlink:href="#wave" fill="#b0bcf9" x="-140" y="0"></use>
			<use class="wave" xlink:href="#wave" fill="#7e9bec" x="20" y="0"></use>
			<use class="wave" xlink:href="#wave" fill="#5078ea" x="70" y="0"></use>
		</svg>
	</div>
	<div class="absolute bottom-12 right-[25rem] w-0 h-2 bg-[#5078ea] slide"></div>
</div>

<style lang="postcss">
	@keyframes wave {
    0% { transform: translateY(0); }
    50% { transform: translateY(10px); }
    100% { transform: translateY(0); }
	}
	.wave {
		animation: wave 2s infinite ease-in-out;
	}
	.wave:nth-child(2) {
		animation-delay: 0.5s;
	}
	.wave:nth-child(3) {
		animation-delay: 1s;
	}

	@keyframes slide {
    0% { width: 0; right: 25rem; }
		15% { width: 3.5rem; right: 23rem; }
    30% { width: 7rem; right: 25rem; }
    100% { width: 7rem; right: 100%; }
	}
	.slide {
		animation: slide 2s 1s ease-out;
	}

	@keyframes svg {
    0% { transform: translateY(100px); }
    100% { transform: translateY(0); opacity: 1; }
	}
	.animate-svg {
		opacity: 0;
		animation: svg 1s 3s forwards;
	}

	@keyframes text {
    0% { transform: translateY(1000px); }
    100% { transform: translateY(0); opacity: 1; }
	}
	.animate-text {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 25rem;
		line-height: 20rem;
		margin-bottom: 3rem;
		font-family:'Times New Roman', Times, serif;
		font-size: 15rem;
	}
	.animate-text .absolute{
		left: 50%;
		bottom: 0;
		height: 8rem;
		color: blue;
		transform: translate(-50%, 0);
		font-size: 11rem;
		line-height: 1.5rem;
	}
	.animate-text .word{
		display: inline-block;
		opacity: 0;
		animation: text 2s forwards;
	}
	.animate-text>.word:nth-of-type(1) { animation-delay: 2.5s; }
	.animate-text>.word:nth-of-type(2) { animation-delay: 2.55s; }
	.animate-text>.word:nth-of-type(3) { animation-delay: 2.6s; }
	.animate-text>.word:nth-of-type(5) { animation-delay: 2.65s; }
	.animate-text>.word:nth-of-type(6) { animation-delay: 2.7s; }
	.animate-text>.word:nth-of-type(7) { animation-delay: 2.75s; }
	.animate-text>.word:nth-of-type(8) { animation-delay: 2.8s; }
	.animate-text>.word:nth-of-type(9) { animation-delay: 2.85s; }
	.animate-text>.word:nth-of-type(10) { animation-delay: 2.9s; }
	.animate-text>.word:nth-of-type(11) { animation-delay: 2.95s; }
	.animate-text div .word:nth-of-type(1) { animation-delay: 2.65s; }
	.animate-text div .word:nth-of-type(2) { animation-delay: 2.7s; }
	.animate-text div .word:nth-of-type(3) { animation-delay: 2.75s; }
	.animate-text div .word:nth-of-type(4) { animation-delay: 2.8s; }
	.animate-text div .word:nth-of-type(5) { animation-delay: 2.85s; }
	.animate-text div .word:nth-of-type(6) { animation-delay: 2.9s; }
	.animate-text div .word:nth-of-type(7) { animation-delay: 2.95s; }
	.animate-text div .word:nth-of-type(8) { animation-delay: 3.0s; }

	@keyframes actions {
    0% { opacity: 0; }
    100% { opacity: 1; }
	}
	.animate-actions {
		opacity: 0;
		animation: actions 1s 3s forwards;
	}

	.card {
		width: 250px;
		height: 3.5rem;
		border-radius: 1.75rem;
	}
</style>
