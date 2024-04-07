import { expect, test } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import Search from "./Search";
import { renderWithClient } from "@/test/queryClientWrapper";
import { QueryClient } from "@tanstack/react-query";
import { createServer } from "@/test/mockServer";
import { Search as SearchIcon } from "lucide-react";
import mockNextRouter from "@/test/mockNextRouter";
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";

createServer([
	{
		url: "/api/proxy/search/guideKeyword",
		method: "get",
		res: ({ request }) => {
			const keyword = new URL(request.url).searchParams.get("keyword");
			if (keyword === "margiela")
				return {
					status: "success",
					data: {
						designers: ["Maison <strong style='color: #155E75'>Margiela</strong>"],
						popular: [
							"Maison <strong style='color: #155E75'>Margiela</strong> Sneakers",
							"Maison <strong style='color: #155E75'>Margiela</strong> Coats",
							"Maison <strong style='color: #155E75'>Margiela</strong> T-Shirts",
						],
					},
				};
			return {
				status: "success",
				data: {
					designers: ["<strong style='color: #155E75'>Raf</strong> Simons"],
					popular: [
						"<strong style='color: #155E75'>Raf</strong> Simons <strong style='color: #0C4A6E'>Sneakers</strong>",
						"Maison Margiela <strong style='color: #0C4A6E'>Sneakers</strong>",
						"<strong style='color: #155E75'>Raf</strong> Simons Leather Shoes",
						"<strong style='color: #155E75'>Raf</strong> Simons Jewelry & Watches",
					],
				},
			};
		},
	},
]);

const setUp = () => {
	const user = userEvent.setup();
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});
	renderWithClient(
		queryClient,
		<RouterContext.Provider value={mockNextRouter({})}>
			<Search>
				<SearchIcon className="mx-1 h-7 w-7" />
			</Search>
		</RouterContext.Provider>,
	);

	return { user };
};

test("should be able to display keywords after searches", async () => {
	const { user } = setUp();

	const searchSvg = screen.getByRole("button");
	await user.click(searchSvg);

	const searchInput = screen.getByRole("textbox");

	await user.type(searchInput, "margiela");

	await waitFor(() => {
		expect(screen).toContainTextWithMarkup("Maison Margiela");
	});
});
