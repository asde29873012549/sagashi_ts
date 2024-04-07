import "@testing-library/jest-dom";
import { loadEnvConfig } from "@next/env";
import { toContainTextWithMarkup } from "@/test/matchers";
import { vi, expect } from "vitest";

loadEnvConfig(process.cwd());

const IntersectionObserverMock = vi.fn(() => ({
	disconnect: vi.fn(),
	observe: vi.fn(),
	takeRecords: vi.fn(),
	unobserve: vi.fn(),
}));

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

expect.extend({
	toContainTextWithMarkup,
});
