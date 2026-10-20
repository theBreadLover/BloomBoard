import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

/**
 * Handles the email-verification redirect from Supabase.
 * Exchanges the one-time confirmation code for an authenticated session,
 * then redirects the user to a safe path within the application.
 */
export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const next = requestUrl.searchParams.get("next");

	const redirectPath =
		next && next.startsWith("/") && !next.startsWith("//")
			? next
			: "/";

	if (!code) {
		return NextResponse.redirect(
			new URL("/login?error=missing-code", requestUrl.origin),
		);
	}

	const supabase = await createClient();
	const {error} = await supabase.auth.exchangeCodeForSession(code);

	if (error) {
		return NextResponse.redirect(
			new URL("/login?error=confirmation-failed", requestUrl.origin),
		);
	}

	return NextResponse.redirect(
		new URL(redirectPath, requestUrl.origin),
	);
}