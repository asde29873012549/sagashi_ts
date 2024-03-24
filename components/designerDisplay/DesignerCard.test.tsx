import { expect, test } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DesignerCard from "./DesignerCard";
// Libs
import { renderWithClient } from "@/test/queryClientWrapper";
import { QueryClient } from "@tanstack/react-query";
import { createServer } from "@/test/mockServer";

createServer([
	{
		url: "/api/proxy/designer",
		method: "post",
		res: () => {
			return {
				status: "success",
				data: [],
			};
		},
	},
]);

const component = (src: string, name: string, designer_id: string) => {
	return (
		<DesignerCard
			src={src}
			className={""}
			name={name}
			designer_id={designer_id}
			isFollowed={false}
			isLoading={false}
		/>
	);
};

test("Follow button should work", async () => {
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
		component(
			"https://storage.googleapis.com/sagashi_designer/logo/maison%20margiela.webp",
			"Maison Margiela",
			"42",
		),
	);

	const followButton = screen.getByRole("button", { name: /follow/i });
	expect(followButton).toHaveTextContent("Follow");

	await user.click(followButton);
	expect(followButton).toHaveTextContent("Following");
});
