import type {WorkSession} from "@/types/project";

const MILLISECONDS_PER_SECOND = 1000;
const ABANDONED_SESSION_THRESHOLD_SECONDS = 12 * 60 * 60;

/**
 * calculates the number of whole seconds elapsed since a work session started.
 *
 * The persisted startedAt timestamp is the source of truth. A negative result is clamped to
 * zero in case the client clock is slightly behind the server.
 *
 * @param startedAt - the time the session started.
 * @param now - the current time the function is called at.
 * @returns number - the time elapsed in seconds since the session started.
 */
export function getElapsedWorkSeconds(
	startedAt: string,
	now: Date = new Date(),
): number {
	const startedAtMilliseconds: number = new Date(startedAt).getTime();
	const elapsedMilliseconds: number = now.getTime() - startedAtMilliseconds;
	const elapsedSeconds: number = Math.floor(elapsedMilliseconds / MILLISECONDS_PER_SECOND,);

	return Math.max(0, elapsedSeconds);
}

/**
 * calculates the total number of completed work seconds.
 *
 * Active sessions are intentionally excluded because their duration is still changing and is displayed separately by the
 * live timer.
 *
 * @param sessions - An array containing all the sessions currently saved.
 * @returns number - the total seconds elapsed from all sessions.
 */
export function getTotalCompletedWorkSeconds(
	sessions: readonly WorkSession[],
): number {
	return sessions.reduce(
		(totalSeconds: number, session: WorkSession): number => {
			if (session.endedAt === null) {
				return totalSeconds;
			}

			const startedAtMilliseconds: number = new Date(session.startedAt).getTime();
			const endedAtMilliseconds: number = new Date(session.endedAt).getTime();

			const sessionSeconds: number = Math.floor(
				(endedAtMilliseconds - startedAtMilliseconds) / 	MILLISECONDS_PER_SECOND
			);

			return totalSeconds + Math.max(0, sessionSeconds);
		},
		0
	);
}

/**
 * Identifies an active session that may be left running accidentally.
 *
 * BloomBoard warns at twelve hours or longer, but does not automatically stop or modify the persisted session.
 *
 * @param startedAt - the time the session started being recorded.
 * @param now - the current time at the moment the function is called at.
 * @returns boolean - returns whether the session has been running for at least 12 hours.
 */
export function isAbandonedWorkSession(
	startedAt: string,
	now: Date = new Date(),
): boolean {
	return (getElapsedWorkSeconds(startedAt, now) >= ABANDONED_SESSION_THRESHOLD_SECONDS);
}
