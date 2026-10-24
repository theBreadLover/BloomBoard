import type {ProjectNote} from "@/types/project";

/**
 * Checks whether two dates fall on the same calendar day (ignoring time of day).
 * @param firstDate - The first date to compare.
 * @param secondDate - The second date to compare.
 * @returns True if both dates are the same calendar day.
 */
function isSameDay(firstDate: Date, secondDate: Date): boolean {
	return firstDate.toDateString() === secondDate.toDateString();
}

/**
 * Creates a stable key for a date in the user's local calendar.
 * Including the full local date keeps values with different years
 * in separate groups.
 */
function getCalendarDayKey(date: Date): string {
	const year: number = date.getFullYear();
	const month: number = date.getMonth() + 1;
	const day: number = date.getDate();

	return `${year}-${month}-${day}`;
}

/**
 * Formats a timestamp as a day-group label for the notes timeline, e.g.
 * "Today", "Yesterday", or "Oct 9" for anything older.
 * @param isoTimestamp - The timestamp to label.
 * @returns A short, human-readable day label.
 */
export function formatDayLabel(isoTimestamp: string): string {
	const date = new Date(isoTimestamp);
	const today = new Date();
	if (isSameDay(date, today)) {
		return "Today";
	}
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	if (isSameDay(date, yesterday)) {
		return "Yesterday";
	}
	return date.toLocaleDateString(undefined, {month: "short", day: "numeric"});
}

/**
 * Formats a timestamp as a short clock time, e.g. "10:42 AM".
 * @param isoTimestamp - The timestamp to format.
 * @returns A locale-formatted time string.
 */
export function formatClockTime(isoTimestamp: string): string {
	return new Date(isoTimestamp).toLocaleTimeString(undefined, {hour: "numeric", minute: "2-digit"});
}


// One day's worth of notes, grouped for the notes' timeline.
export interface NoteDayGroup {
	dayLabel: string;
	notes: ProjectNote[];
}

/**
 * Groups a list of notes (assumed already sorted newest-first) by calendar
 * day, preserving that newest-first order across groups.
 * @param notes - The notes to group, newest first.
 * @returns An array of day groups, newest day first.
 */
export function groupNotesByDay(notes: ProjectNote[]): NoteDayGroup[] {
	const groupsByDay: Map<string, NoteDayGroup> = new Map();

	for (const note of notes) {
		const noteDate: Date = new Date(note.createdAt);
		const dayKey: string = getCalendarDayKey(noteDate);
		const existingGroup: NoteDayGroup | undefined = groupsByDay.get(dayKey);

		if (existingGroup) {
			existingGroup.notes.push(note);
			continue;
		}

		groupsByDay.set(dayKey, {
			dayLabel: formatDayLabel(note.createdAt),
			notes: [note],
		});
	}

	// Map preserves insertion order, which keeps the supplied newest-first order.
	return Array.from(groupsByDay.values());
}

/**
 * Formats a duration in seconds as "H:MM:SS" (or "M:SS" under an hour), for
 * the running work timer.
 * @param totalSeconds - The elapsed duration, in whole seconds.
 * @returns A clock-style duration string.
 */
export function formatDuration(totalSeconds: number): string {
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	const paddedMinutes = minutes.toString().padStart(2, "0");
	const paddedSeconds = seconds.toString().padStart(2, "0");
	return hours > 0 ? `${hours}:${paddedMinutes}:${paddedSeconds}` : `${minutes}:${paddedSeconds}`;
}