<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { getModalStore, getToastStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import hljs from 'highlight.js';
	import { XMark } from '@inqling/svelte-icons/heroicon-24-solid';
	import { Trash, Cog8Tooth } from '@inqling/svelte-icons/heroicon-24-outline';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { chatStore, isLoadingAnswerStore, settingsStore } from '$misc/stores';
	import Toolbar from '$lib/Toolbar.svelte';
	import ChatInput from '$lib/ChatInput.svelte';
	import Chat from '$lib/Chat.svelte';
	import HintMessage from '$lib/HintMessage.svelte';
	import TokenCost from '$lib/TokenCost.svelte';
	import { countTokens, estimateChatCost } from '$misc/openai';
	import {
		canSuggestTitle,
		createNewChat,
		showModalComponent,
		showToast,
		suggestChatTitle,
		track,
		type ChatMessage
	} from '$misc/shared';
	import snarkdown from 'snarkdown';
	import Header from '$lib/Header.svelte';

	const modalStore = getModalStore();
	const toastStore = getToastStore();

	export let data: PageData;

	$: ({ slug } = data);
	$: chat = $chatStore[slug];
	$: cost = chat ? estimateChatCost(chat) : null;
	$: hasContext = chat?.contextMessage?.content?.length || false;
	$: hasStopSequence = chat?.settings.stop?.length || false;

	$: sortedChats = Object.entries($chatStore).sort((a, b) => {
		return new Date(b[1].created).getTime() - new Date(a[1].created).getTime();
	});

	let chatInput: ChatInput;

	onMount(async () => {
		await highlightCode();
	});

	const unsubscribeChatStore = chatStore.subscribe(async () => {
		await highlightCode();
	});

	const unsubscribeisLoadingAnswerStore = isLoadingAnswerStore.subscribe(async () => {
		await highlightCode();
	});

	onDestroy(() => {
		unsubscribeChatStore();
		unsubscribeisLoadingAnswerStore();
	});

	async function highlightCode() {
		await tick();
		hljs.highlightAll();
	}

	function showConfirmDeleteModal() {
		const modal: ModalSettings = {
			type: 'confirm',
			title: 'Please confirm',
			body: 'Are you sure you want to delete this chat?',
			response: (result: boolean) => {
				if (result) {
					deleteChat();
				}
			}
		};
		modalStore.trigger(modal);
	}

	const handleChatShared = (savedSlug: boolean) => {
		// sharing might have updated the slug of this chat
		// so we are either already on that page, or we go there
		if (savedSlug) {
			goto(`/${savedSlug}`);
		}
	};

	function deleteChat(dontTrack = false) {
		if (!dontTrack) {
			track('deleteChat');
		}
		chatStore.deleteChat(slug);
		goto('/');
	}

	async function handleCloseChat() {
		// untouched => discard
		if (chat.title === slug && !chat.contextMessage?.content && chat.messages.length === 0) {
			showToast(toastStore, 'Empty chat was discarded automatically', 'secondary');
			deleteChat(true);
		}

		// already has a title
		if (chat.title !== slug || !canSuggestTitle(chat)) {
			goto('/');
			return;
		}

		// has no title
		if ($settingsStore.useTitleSuggestions) {
			if ($settingsStore.openAiApiKey) {
				const title = await suggestChatTitle(chat, $settingsStore.openAiApiKey);
				chatStore.updateChat(slug, { title });
				showToast(toastStore, `Chat title set to: '${title}'`, 'secondary');
			}
			goto('/');
		} else {
			showModalComponent(modalStore, 'SuggestTitleModal', { slug }, () => {
				// see https://www.reddit.com/r/sveltejs/comments/10o7tpu/sveltekit_issue_goto_not_working_on_ios/
				// await tick() doesn't fix it, hence setTimeout
				setTimeout(() => goto('/'), 0);
			});
		}
	}

	function handleRenameChat(event: CustomEvent<string>) {
		chatStore.updateChat(slug, { title: event.detail });
	}

	function handleEditMessage(event: CustomEvent<ChatMessage>) {
		chatInput.editMessage(event.detail);
	}
</script>

<div class="h-[100vh]">
	<Header isRootRoute={false}/>
	{#if chat}
		<div class="h-[calc(100%-3.2rem)] md:h-[calc(100%-5.2rem)] bg-white lg:px-12">
			<Toolbar
				{slug}
				title={chat.title}
				on:closeChat={handleCloseChat}
				on:renameChat={handleRenameChat}
			>
				<svelte:fragment slot="actions">
					<!-- Settings -->
					<span class="relative inline-flex">
						<button
							class="toolbtn bg-white"
							on:click={() => showModalComponent(modalStore, 'SettingsModal', { slug })}
						>
						<svg class="icon w-7 h-7" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
							<path d="M550.4 74.666667c25.6 0 46.933333 19.2 53.333333 44.8l14.933334 85.333333 38.4 17.066667L727.466667 170.666667c19.2-14.933333 46.933333-12.8 66.133333 4.266666l2.133333 2.133334 53.333334 53.333333c19.2 19.2 21.333333 46.933333 6.4 68.266667l-49.066667 70.4 17.066667 38.4 85.333333 14.933333c23.466667 4.266667 42.666667 25.6 44.8 49.066667v78.933333c0 25.6-19.2 46.933333-44.8 53.333333l-85.333333 14.933334-17.066667 38.4 49.066667 70.4c14.933333 19.2 12.8 46.933333-4.266667 66.133333l-2.133333 2.133333-53.333334 53.333334c-19.2 19.2-46.933333 21.333333-68.266666 6.4l-70.4-49.066667-38.4 17.066667-14.933334 85.333333c-4.266667 23.466667-25.6 42.666667-49.066666 44.8h-78.933334c-25.6 0-46.933333-19.2-53.333333-44.8l-14.933333-85.333333-38.4-17.066667-72.533334 46.933333c-19.2 14.933333-46.933333 12.8-66.133333-4.266666l-2.133333-2.133334-53.333334-53.333333c-19.2-19.2-21.333333-46.933333-6.4-68.266667l49.066667-70.4-17.066667-38.4-85.333333-14.933333c-23.466667-4.266667-42.666667-25.6-44.8-49.066667v-78.933333c0-25.6 19.2-46.933333 44.8-53.333333l85.333333-14.933334 17.066667-38.4L170.666667 296.533333c-14.933333-19.2-12.8-46.933333 2.133333-64l2.133333-2.133333 53.333334-53.333333c19.2-19.2 46.933333-21.333333 68.266666-6.4l70.4 49.066666 38.4-17.066666 14.933334-85.333334c4.266667-23.466667 25.6-42.666667 49.066666-44.8H550.4z m-38.4 320c-64 0-117.333333 53.333333-117.333333 117.333333s53.333333 117.333333 117.333333 117.333333 117.333333-53.333333 117.333333-117.333333-53.333333-117.333333-117.333333-117.333333z" fill="#7f7f7f"></path>
						</svg>
						</button>
						{#if !$settingsStore.openAiApiKey}
							<span class="relative flex h-3 w-3">
								<span
									style="left: -10px;"
									class="animate-ping absolute inline-flex h-full w-full rounded-full bg-error-400 opacity-75"
								/>
								<span
									style="left: -10px;"
									class="relative inline-flex rounded-full h-3 w-3 bg-error-500"
								/>
							</span>
						{/if}
					</span>
	
					<!-- Delete -->
					<button class="toolbtn" style="background-color: red;" on:click={showConfirmDeleteModal}>
						<img class="w-8 h-8" src="/delete.png" alt="删除" />
					</button>
				</svelte:fragment>
			</Toolbar>
	
			<div class="flex py-8" style="height: calc(100% - 3.5rem);">
				<div class="h-full w-[300px] pt-4 px-8 bg-[#f3f3f3] rounded-xl">
					<div class="flex items-center gap-2">
						<svg class="icon w-8 h-8" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
							<path d="M512.005628 86.322018 619.43129 394.883629l340.15005 2.428306L696.758446 605.436042 800.160467 937.679006 512.005628 739.707119 223.851812 937.679006l96.717785-336.665693L64.416614 397.311935l340.16233-2.428306L512.005628 86.322018z" fill="#000000" data-spm-anchor-id="a313x.search_index.0.i17.f9d53a81u8HbTO" class="selected"></path>
						</svg>
						<div class="text-xl font-bold italic pb-1" style="border-bottom: 2px solid black">对话历史记录</div>
					</div>
					
	
						{#each sortedChats as [slug, chat]}
						<div class="flex items-center gap-4 mt-4 pl-[0.7rem]">
							<div class="w-1 h-1 bg-[#3b3838] rounded-[0.25rem]"></div>
							<a href={`/${slug}`} target="_blank" class="flex-1 text-overflow">
								{ chat.title }
							</a>
						</div>
						{/each}
				</div>
				<div class="relative flex-1 px-8 max-h-full overflow-y-auto">
					<Chat {slug} on:editMessage={handleEditMessage}>
						<svelte:fragment slot="additional-content-top">
							<!-- Language hint -->
							{#if !$settingsStore.hideLanguageHint}
								<HintMessage title="Did you know?" variantClass="variant-ghost-surface">
									<p>
										ChatGPT understands various languages. You can just ask your questions in German if you
										like.
									</p>
									<svelte:fragment slot="actions">
										<button class="btn btn-sm" on:click={() => ($settingsStore.hideLanguageHint = true)}>
											<XMark class="w-6 h-6" />
										</button>
									</svelte:fragment>
								</HintMessage>
							{/if}
			
							<!-- Context -->
							<HintMessage
								title="Context"
								variantClass="variant-ghost-tertiary"
								actionClass="grid h-full"
								omitAlertActionsClass={true}
							>
								{#if hasContext && chat.contextMessage.content}
									<p>
										{@html snarkdown(chat.contextMessage.content)}
									</p>
								{/if}
								{#if hasStopSequence}
									<p class="text-xs text-slate-500">
										Stop:
										{Array.isArray(chat.settings.stop) ? chat.settings.stop.join(', ') : chat.settings.stop}
									</p>
								{/if}
								{#if !hasContext && !hasStopSequence}
									<p>
										You can give the AI an initial <strong>context</strong> for your chat which greatly
										changes the way it will behave during the conversation. Use a
										<strong>stop sequence</strong> to limit the answers given by ChatGPT.
									</p>
								{/if}
			
								<svelte:fragment slot="actions">
									{#if hasContext}
										<!-- Tokens -->
										<div class="justify-self-end mb-2">
											<TokenCost tokens={countTokens(chat.contextMessage)} />
										</div>
									{/if}
									<div class="flex flex-row md:flex-col space-x-2 space-y-2">
										<button
											class="btn self-center variant-filled-primary"
											on:click={() => showModalComponent(modalStore, 'ContextModal', { slug })}
										>
											Edit
										</button>
										{#if hasContext}
											<button
												class="btn self-center variant-filled-tertiary"
												on:click={() =>
													createNewChat({ context: chat.contextMessage.content, settings: chat.settings })}
											>
												New Chat
											</button>
										{/if}
									</div>
								</svelte:fragment>
							</HintMessage>
						</svelte:fragment>
					</Chat>
	
					<ChatInput {slug} chatCost={cost} bind:this={chatInput} />
				</div>
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	.toolbtn {
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 1.75rem;
	}

	.text-overflow {
		display: block;
		font-size: 1rem;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
</style>