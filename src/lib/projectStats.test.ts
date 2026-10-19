import {describe, expect, it} from "vitest";
import {computeProjectProgress} from "@/lib/projectStats";
import type {ProjectTask} from "@/types/project";

function createTask(
	id: string,
	projectId: string,
	isDone: boolean,
): ProjectTask {
	return {
		id,
		projectId,
		title: `Task ${id}`,
		isDone,
		createdAt: "2026-10-15T12:00:00.000Z",
	};
}

describe("computeProjectProgress", () => {
	it("returns zero when the project has no tasks", () => {
		const progress = computeProjectProgress("project-1", []);

		expect(progress).toBe(0);
	});

	it("ignores tasks belonging to other projects", () => {
		const tasks = [
			createTask("1", "project-2", true),
			createTask("2", "project-2", false),
		];

		const progress = computeProjectProgress("project-1", tasks);

		expect(progress).toBe(0);
	});

	it("calculates the percentage of completed project tasks", () => {
		const tasks = [
			createTask("1", "project-1", true),
			createTask("2", "project-1", false),
			createTask("3", "project-2", false),
			createTask("4", "project-2", false),
		];

		const progress = computeProjectProgress("project-1", tasks);

		expect(progress).toBe(50);
	});

	it("rounds the completion percentage to the nearest integer", () => {
		const tasks = [
			createTask("1", "project-1", true),
			createTask("2", "project-1", false),
			createTask("3", "project-1", false),
		];

		const progress = computeProjectProgress("project-1", tasks);

		expect(progress).toBe(33);
	});
});