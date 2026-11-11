import {beforeEach, describe, expect, it, vi} from "vitest";

import {startWorkSession} from "@/app/actions";
import {createClient} from "@/lib/supabase/server";
import {revalidatePath} from "next/cache";

vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
	createClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createClient);
const mockedRevalidatePath = vi.mocked(revalidatePath);

interface StartWorkSessionRpcRow {
	status: "success" | "already_active" | "not_found" | "unauthorized";
	session_id: string | null;
	user_id: string | null;
	project_id: string | null;
	started_at: string | null;
	ended_at: string | null;
	active_project_id: string | null;
}

interface RpcErrorFixture {
	code?: string;
	message: string;
}

function mockStartWorkSessionRpc(
	row: StartWorkSessionRpcRow | null,
	error: RpcErrorFixture | null = null,
): ReturnType<typeof vi.fn> {
	const rpc = vi.fn().mockResolvedValue({
		data: row === null ? null : [row],
		error,
	});

	mockedCreateClient.mockResolvedValue({
		rpc,
	} as never);

	return rpc;
}

describe("startWorkSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns the persisted session when the database starts one", async () => {
		const rpc = mockStartWorkSessionRpc({
			status: "success",
			session_id: "session-1",
			user_id: "user-1",
			project_id: "project-1",
			started_at: "2026-10-26T12:00:00.000Z",
			ended_at: null,
			active_project_id: null,
		});

		const result = await startWorkSession("project-1");

		expect(rpc).toHaveBeenCalledWith("start_work_session", {
			requested_project_id: "project-1",
		});

		expect(result).toEqual({
			status: "success",
			session: {
				id: "session-1",
				userId: "user-1",
				projectId: "project-1",
				startedAt: "2026-10-26T12:00:00.000Z",
				endedAt: null,
			},
		});

		expect(mockedRevalidatePath).toHaveBeenCalledWith("/");
		expect(mockedRevalidatePath).toHaveBeenCalledWith(
			"/project/project-1",
		);
	});

	it("returns the active project when another work session is already running", async () => {
		const rpc = mockStartWorkSessionRpc({
			status: "already_active",
			session_id: null,
			user_id: null,
			project_id: null,
			started_at: null,
			ended_at: null,
			active_project_id: "project-active",
		});

		const result = await startWorkSession("project-requested");

		expect(rpc).toHaveBeenCalledWith("start_work_session", {
			requested_project_id: "project-requested",
		});

		expect(result).toEqual({
			status: "already-active",
			activeProjectId: "project-active",
		});

		expect(mockedRevalidatePath).not.toHaveBeenCalled();
	});

	it("returns not-found when the project is unavailable to the user", async () => {
		mockStartWorkSessionRpc({
			status: "not_found",
			session_id: null,
			user_id: null,
			project_id: null,
			started_at: null,
			ended_at: null,
			active_project_id: null,
		});

		const result = await startWorkSession("project-1");

		expect(result).toEqual({
			status: "not-found",
			message: "The project could not be found.",
		});

		expect(mockedRevalidatePath).not.toHaveBeenCalled();
	});

	it("returns unauthorized when the database rejects an unauthenticated caller", async () => {
		mockStartWorkSessionRpc(null, {
			code: "42501",
			message: "permission denied for function start_work_session",
		});

		const result = await startWorkSession("project-1");

		expect(result).toEqual({
			status: "unauthorized",
			message: "You must be signed in to start a work session.",
		});

		expect(mockedRevalidatePath).not.toHaveBeenCalled();
	});

	it("returns an error when the database command fails", async () => {
		mockStartWorkSessionRpc(
			null,
			{
				message: "Database command failed",
			},
		);

		const result = await startWorkSession("project-1");

		expect(result).toEqual({
			status: "error",
			message: "Could not start the work session. Try again.",
		});

		expect(mockedRevalidatePath).not.toHaveBeenCalled();
	});

	it("returns an error when the database command returns no result", async () => {
		mockStartWorkSessionRpc(null);

		const result = await startWorkSession("project-1");

		expect(result).toEqual({
			status: "error",
			message: "Could not start the work session. Try again.",
		});

		expect(mockedRevalidatePath).not.toHaveBeenCalled();
	});

	it("returns an error when a successful result is missing session data", async () => {
		mockStartWorkSessionRpc({
			status: "success",
			session_id: null,
			user_id: "user-1",
			project_id: "project-1",
			started_at: "2026-10-26T12:00:00.000Z",
			ended_at: null,
			active_project_id: null,
		});

		const result = await startWorkSession("project-1");

		expect(result).toEqual({
			status: "error",
			message: "Could not start the work session. Try again.",
		});

		expect(mockedRevalidatePath).not.toHaveBeenCalled();
	});
});
