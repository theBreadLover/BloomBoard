const DEFAULT_REDIRECT_PATH = "/";

/**
 * Returns a safe path within BloomBoard.
 *
 * Redirect candidates come from URL query parameters and must be treated as
 * untrusted input. Only root-relative paths are allowed. Protocol-relative
 * paths and backslashes are rejected because URL parsers may interpret them
 * as external destinations.
 */
export function getSafeRedirectPath(candidate: string | null): string {
	if (
		candidate === null ||
		!candidate.startsWith("/") ||
		candidate.startsWith("//") ||
		candidate.includes("\\")
	) {
		return DEFAULT_REDIRECT_PATH;
	}

	return candidate;
}
