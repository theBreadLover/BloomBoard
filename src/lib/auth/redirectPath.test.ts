import {describe, expect, it} from "vitest";

import {getSafeRedirectPath} from "@/lib/auth/redirectPath";

interface RedirectPathTestCase {
	candidate: string | null;
	expectedPath: string;
}

const REDIRECT_PATH_CASES: readonly RedirectPathTestCase[] = [
	{candidate: "/project/123", expectedPath: "/project/123"},
	{candidate: "/project/123?tab=notes", expectedPath: "/project/123?tab=notes"},
	{candidate: null, expectedPath: "/"},
	{candidate: "", expectedPath: "/"},
	{candidate: "project/123", expectedPath: "/"},
	{candidate: "//example.com", expectedPath: "/"},
	{candidate: "https://example.com", expectedPath: "/"},
	{candidate: "/\\example.com", expectedPath: "/"},
];

describe("getSafeRedirectPath", () => {
	it.each(REDIRECT_PATH_CASES)(
		"Returns $expectedPath for $candidate",
		({candidate, expectedPath}: RedirectPathTestCase) => {
			expect(getSafeRedirectPath(candidate)).toBe(expectedPath);
		}
	);
});