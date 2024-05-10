import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const notification_server = process.env.NOTIFICATION_SERVER;
const static_image_src = process.env.STATIC_IMAGE_SRC;
const isProduction = process.env.NODE_ENV === "production";

export function middleware(request: NextRequest) {
	const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
	const sriptSrc = isProduction
		? `'self' 'nonce-${nonce}' 'strict-dynamic'`
		: `'self' 'unsafe-eval'`;
	const styleSrc = `'self' 'unsafe-inline'`;
	const cspHeader = `
    default-src 'self';
    script-src ${sriptSrc};
    style-src ${styleSrc};
    img-src 'self' blob: data: ${static_image_src} lh3.googleusercontent.com github.com avatars.githubusercontent.com;
	connect-src 'self' ws: ${notification_server!.split("://")[1]};
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;`;

	// Replace newline characters and spaces
	const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, " ").trim();

	const requestHeaders = new Headers(request.headers);
	requestHeaders.set("x-nonce", nonce);
	requestHeaders.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);

	const response = NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});
	response.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		{
			source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
			missing: [
				{ type: "header", key: "next-router-prefetch" },
				{ type: "header", key: "purpose", value: "prefetch" },
			],
		},
	],
};
