import type { Screen } from "@testing-library/react";

interface MatcherState {
	isNot: boolean;
}

export function toContainTextWithMarkup(this: MatcherState, received: Screen, expected: string) {
	const { isNot } = this;
	const elementsWithText = received.getAllByText((_, element) => element?.textContent === expected);

	return {
		pass: elementsWithText.length > 0,
		message: () => `${isNot ? "Found" : "Failed to find"} text "${expected}" in the given element.`,
	};
}
