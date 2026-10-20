// @vitest-environment jsdom

import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";

import StatusBadge from "@/components/StatusBadge";
import type {ProjectStatus} from "@/types/project";

interface StatusBadgeTestCase {
	status: ProjectStatus;
	expectedLabel: string;
}

const STATUS_CASES: readonly StatusBadgeTestCase[] = [
	{status: "working", expectedLabel: "Working"},
	{status: "postponed", expectedLabel: "Postponed"},
	{status: "finished", expectedLabel: "Finished"},
	{status: "abandoned", expectedLabel: "Abandoned"},
]

describe("StatusBadge", () => {
	it.each(STATUS_CASES)("renders the $expectedLabel label for the $status status",
		({status, expectedLabel}: StatusBadgeTestCase) => {
		render(<StatusBadge status={status} />);

		expect(screen.getByText(expectedLabel)).toBeInTheDocument();
		// Assert the behavior visible to the user
	})
})