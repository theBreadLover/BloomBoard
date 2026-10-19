import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {
	formatDayLabel,
	formatDuration,
	groupNotesByDay,
} from "@/lib/dateUtils";
import type {ProjectNote} from "@/types/project";

function createNote(
	id: string,
	createdAt: string,
): ProjectNote {
	return {
		id,
		projectId: "project-1",
		taskId: null,
		body: `Note ${id}`,
		createdAt,
	};
}

describe("formatDuration", () => {
	it("formats durations below one hour as M:SS", () => {
		expect(formatDuration(0)).toBe("0:00");
		expect(formatDuration(65)).toBe("1:05");
		expect(formatDuration(3599)).toBe("59:59");
	});

	it("formats durations of at least one hour as H:MM:SS", () => {
		expect(formatDuration(3600)).toBe("1:00:00");
		expect(formatDuration(3665)).toBe("1:01:05");
	});
});

describe("formatDayLabel", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-10-15T16:00:00.000Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("labels the current calendar day as Today", () => {
		expect(formatDayLabel("2026-10-15T18:00:00.000Z")).toBe("Today");
	});

	it("labels the previous calendar day as Yesterday", () => {
		expect(formatDayLabel("2026-10-14T18:00:00.000Z")).toBe("Yesterday");
	});
});

describe("groupNotesByDay", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-10-15T16:00:00.000Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("groups notes from the same calendar day", () => {
		const notes = [
			createNote("newer", "2026-10-13T20:00:00.000Z"),
			createNote("older", "2026-10-13T16:00:00.000Z"),
		];

		const groups = groupNotesByDay(notes);

		expect(groups).toHaveLength(1);
		expect(groups[0]?.notes.map((note) => note.id)).toEqual([
			"newer",
			"older",
		]);
	});

	it("preserves the supplied newest-first order across groups", () => {
		const notes = [
			createNote("newest", "2026-10-13T20:00:00.000Z"),
			createNote("middle", "2026-10-12T20:00:00.000Z"),
			createNote("oldest", "2026-10-11T20:00:00.000Z"),
		];

		const groups = groupNotesByDay(notes);

		expect(groups.map((group) => group.notes[0]?.id)).toEqual([
			"newest",
			"middle",
			"oldest",
		]);
	});

	it("keeps matching month and day values from different years separate", () => {
		const notes = [
			createNote("current-year", "2025-10-09T16:00:00.000Z"),
			createNote("previous-year", "2024-10-09T16:00:00.000Z"),
		];

		const groups = groupNotesByDay(notes);

		expect(groups).toHaveLength(2);
		expect(groups.map((group) => group.notes[0]?.id)).toEqual([
			"current-year",
			"previous-year",
		]);
	});
});