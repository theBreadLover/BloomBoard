import {describe, expect, it} from "vitest";

import {
	getElapsedWorkSeconds,
	getTotalCompletedWorkSeconds,
	isAbandonedWorkSession
} from "@/lib/workSessions";
import type {WorkSession} from "@/types/project";

function createWorkSession(
	id: string,
	startedAt: string,
	endedAt: string | null,
): WorkSession {
	return {
		id,
		userId: "user-1",
		projectId: "project-1",
		startedAt,
		endedAt,
	};
}

describe("getElapsedWorkSeconds", () => {
	it("returns the elapsed whole seconds since the session started", () => {
		const startedAt = "2026-10-26T12:00:00.000Z";
		const now = new Date("2026-10-26T12:01:05.900Z");

		expect(getElapsedWorkSeconds(startedAt, now)).toBe(65);
	});

	it("returns zero when the current time is earlier than the start time", () => {
		const startedAt = "2026-10-26T12:00:10.000Z";
		const now = new Date("2026-10-26T12:00:00.000Z");

		expect(getElapsedWorkSeconds(startedAt, now)).toBe(0);
	});
});

describe("getTotalCompletedWorkSeconds", () => {
	it("returns zero when there are no sessions", () => {
		expect(getTotalCompletedWorkSeconds([])).toBe(0);
	});

	it("sums completed sessions and ignores active session", () => {
		const sessions: WorkSession[] = [
			createWorkSession(
				"session-1",
				"2026-10-26T10:00:00.000Z",
				"2026-10-26T10:30:00.000Z",
				),
			createWorkSession(
				"session-2",
				"2026-10-26T11:00:00.000Z",
				"2026-10-26T11:45:30.000Z",
				),
			createWorkSession(
		"session-3",
				"2026-10-26T12:00:00.000Z",
				null,
				),
		];

		expect(getTotalCompletedWorkSeconds(sessions)).toBe(4530);
	});

	it("correctly sums a session that spans midnight", () => {
		const sessions: WorkSession[] = [
			createWorkSession(
				"session-1",
				"2026-10-26T23:45:00.000Z",
				"2026-10-27T00:15:00.000Z",
			),
		];

		expect(getTotalCompletedWorkSeconds(sessions)).toBe(1800);
	})

	it("does not subtract time for an invalid negative session duration", () => {
		const sessions: WorkSession[] = [
			createWorkSession(
				"valid-session",
				"2026-10-26T10:00:00.000Z",
				"2026-10-26T10:30:00.000Z",
			),
			createWorkSession(
				"invalid-session",
				"2026-10-26T12:30:00.000Z",
				"2026-10-26T12:00:00.000Z",
			),
		];

		expect(getTotalCompletedWorkSeconds(sessions)).toBe(1800);
	});
});


describe("isAbandonedWorkSession", () => {
	it("does not flag a session shorter than twelve hours", () => {
		const startedAt = "2026-10-26T00:00:00.000Z";
		const now = new Date("2026-10-26T11:59:59.000Z");

		expect(isAbandonedWorkSession(startedAt, now)).toBe(false);
	});

	it("flags a session at exactly twelve hours", () => {
		const startedAt = "2026-10-26T00:00:00.000Z";
		const now = new Date("2026-10-26T12:00:00.000Z");

		expect(isAbandonedWorkSession(startedAt, now)).toBe(true);
	});

	it("flags a session longer than twelve hours", () => {
		const startedAt = "2026-10-26T00:00:00.000Z";
		const now = new Date("2026-10-26T14:30:00.000Z");

		expect(isAbandonedWorkSession(startedAt, now)).toBe(true);
	});
});
