import type { AstroIntegration } from "@swup/astro";

// 声明 Svelte 组件模块，使 client:only 指令能够正确类型检查
// Astro 的 client:only 指令需要组件接受任意属性
declare module "*.svelte" {
	import type { SvelteComponent } from "svelte";

	// 使用 unknown 类型以支持 Astro 的 client:* 指令
	const Component: new (
		...args: never[]
	) => SvelteComponent<
		Record<string, unknown>,
		Record<string, unknown>,
		Record<string, unknown>
	>;
	export default Component;
}

declare global {
	interface Window {
		// type from '@swup/astro' is incorrect
		swup: AstroIntegration;
		pagefind: {
			search: (query: string) => Promise<{
				results: Array<{
					data: () => Promise<SearchResult>;
				}>;
			}>;
		};
	}
}

interface SearchResult {
	url: string;
	meta: {
		title: string;
	};
	excerpt: string;
	content?: string;
	word_count?: number;
	filters?: Record<string, unknown>;
	anchors?: Array<{
		element: string;
		id: string;
		text: string;
		location: number;
	}>;
	weighted_locations?: Array<{
		weight: number;
		balanced_score: number;
		location: number;
	}>;
	locations?: number[];
	raw_content?: string;
	raw_url?: string;
	sub_results?: SearchResult[];
}
