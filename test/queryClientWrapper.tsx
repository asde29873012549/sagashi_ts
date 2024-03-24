import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function renderWithClient(client: QueryClient, ui: React.ReactElement) {
	const { rerender, ...result } = render(
		<QueryClientProvider client={client}>{ui}</QueryClientProvider>,
	);
	return {
		...result,
		rerender: (rerenderUi: React.ReactElement) =>
			rerender(<QueryClientProvider client={client}>{rerenderUi}</QueryClientProvider>),
	};
}
