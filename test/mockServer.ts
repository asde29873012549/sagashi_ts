import { beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse, JsonBodyType } from "msw";

interface HandlerConfig {
	url: string;
	method?: "get" | "post" | "put" | "delete" | "patch";
	res: (args: {
		request: Request;
		params: Record<string, string | readonly string[]>;
		cookies: Record<string, string>;
	}) => JsonBodyType;
}

export function createServer(handlerConfig: HandlerConfig[]) {
	const handlers = handlerConfig.map((config: HandlerConfig) => {
		return http[config.method || "get"](config.url, ({ request, params, cookies }) => {
			return HttpResponse.json(config.res({ request, params, cookies }));
		});
	});

	const server = setupServer(...handlers);

	server.events.on("request:start", ({ request }) => {
		console.log("Outgoing:", request.method, request.url);
	});

	beforeAll(() => server.listen());
	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());
}
