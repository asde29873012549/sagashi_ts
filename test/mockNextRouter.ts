import { NextRouter } from "next/router";
import { vitest } from "vitest";

export default function mockNextRouter(router: Partial<NextRouter>): NextRouter {
	return {
		basePath: "",
		pathname: "/",
		route: "/",
		query: {},
		asPath: "/",
		back: vitest.fn(),
		beforePopState: vitest.fn(),
		prefetch: vitest.fn(),
		push: vitest.fn(),
		reload: vitest.fn(),
		replace: vitest.fn(),
		events: {
			on: vitest.fn(),
			off: vitest.fn(),
			emit: vitest.fn(),
		},
		isFallback: false,
		isLocaleDomain: false,
		isReady: true,
		defaultLocale: "en",
		domainLocales: [],
		isPreview: false,
		forward: vitest.fn(),
		...router,
	};
}
