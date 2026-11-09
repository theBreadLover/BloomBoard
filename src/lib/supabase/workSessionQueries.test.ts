import {beforeEach, describe, expect, it, vi} from "vitest";

import {createClient} from "@/lib/supabase/server";
import {
	getActiveWorkSession,
	getWorkSessionsForProject,
} from "@/lib/supabase/workSessionQueries";

vi.mock("@/lib/supabase/server", () => ({
	createClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createClient);

describe("getActiveWorkSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns the active session with its project name", async () => {
		const maybeSingle = vi.fn().mockResolvedValue({
			data: {
				id: "session-1",
				user_id: "user-1",
				project_id: "project-1",
				started_at: "2026-10-26T12:00:00.000Z",
				ended_at: null,
				projects: [{
					name: "BloomBoard",
				}],
			},
			error: null,
		});

		const is = vi.fn().mockReturnValue({maybeSingle});
		const select = vi.fn().mockReturnValue({is});
		const from = vi.fn().mockReturnValue({select});

		mockedCreateClient.mockResolvedValue({
			from,
		} as never);

		const session = await getActiveWorkSession();

		expect(from).toHaveBeenCalledWith("work_sessions");
		expect(is).toHaveBeenCalledWith("ended_at", null);
		expect(session).toEqual({
			id: "session-1",
			userId: "user-1",
			projectId: "project-1",
			projectName: "BloomBoard",
			startedAt: "2026-10-26T12:00:00.000Z",
			endedAt: null,
		});
	});

	it("returns null when there is no active session", async () => {
		const maybeSingle = vi.fn().mockResolvedValue({
			data: null,
			error: null,
		});

		const is = vi.fn().mockReturnValue({maybeSingle});
		const select = vi.fn().mockReturnValue({is});
		const from = vi.fn().mockReturnValue({select});

		mockedCreateClient.mockResolvedValue({
			from,
		} as never);

		await expect(getActiveWorkSession()).resolves.toBeNull();
	});

	it("returns null when the active session has no joined project", async () => {
		const maybeSingle = vi.fn().mockResolvedValue({
			data: {
				id: "session-1",
				user_id: "user-1",
				project_id: "project-1",
				started_at: "2026-10-26T12:00:00.000Z",
				ended_at: null,
				projects: [],
			},
			error: null,
		});

		const is = vi.fn().mockReturnValue({maybeSingle});
		const select = vi.fn().mockReturnValue({is});
		const from = vi.fn().mockReturnValue({select});

		mockedCreateClient.mockResolvedValue({
			from,
		} as never);

		await expect(getActiveWorkSession()).resolves.toBeNull();
	});
});

describe("getWorkSessionsForProject", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns project sessions newest first with mapped field names", async () => {
		const order = vi.fn().mockResolvedValue({
			data: [
				{
					id: "session-2",
					user_id: "user-1",
					project_id: "project-1",
					started_at: "2026-10-26T12:00:00.000Z",
					ended_at: null,
				},
				{
					id: "session-1",
					user_id: "user-1",
					project_id: "project-1",
					started_at: "2026-10-26T10:00:00.000Z",
					ended_at: "2026-10-26T10:30:00.000Z",
				},
			],
			error: null,
		});

		const eq = vi.fn().mockReturnValue({order});
		const select = vi.fn().mockReturnValue({eq});
		const from = vi.fn().mockReturnValue({select});

		mockedCreateClient.mockResolvedValue({
			from,
		} as never);

		const sessions = await getWorkSessionsForProject("project-1");

		expect(eq).toHaveBeenCalledWith("project_id", "project-1");
		expect(order).toHaveBeenCalledWith("started_at", {
			ascending: false,
		});

		expect(sessions).toEqual([
			{
				id: "session-2",
				userId: "user-1",
				projectId: "project-1",
				startedAt: "2026-10-26T12:00:00.000Z",
				endedAt: null,
			},
			{
				id: "session-1",
				userId: "user-1",
				projectId: "project-1",
				startedAt: "2026-10-26T10:00:00.000Z",
				endedAt: "2026-10-26T10:30:00.000Z",
			},
		]);
	});

	it("returns an empty array when the project has no sessions", async () => {
		const order = vi.fn().mockResolvedValue({
			data: [],
			error: null,
		});

		const eq = vi.fn().mockReturnValue({order});
		const select = vi.fn().mockReturnValue({eq});
		const from = vi.fn().mockReturnValue({select});

		mockedCreateClient.mockResolvedValue({
			from,
		} as never);

		await expect(
			getWorkSessionsForProject("project-1"),
		).resolves.toEqual([]);
	});
});