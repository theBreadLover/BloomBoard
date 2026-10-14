import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

/**
 * Handles the redirect from a Supabase magic-link email: exchanges the
 * one-time code for a real signed-in session, then sends the user back
 * into the app.
 */
export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const next = requestUrl.searchParams.get("next");
	const redirectPath = next && next.startsWith("/") && !next.startsWith("//")
		? next
		: "/"

	if (!code) return NextResponse.redirect(new URL("/login?confirmed=true", requestUrl.origin));

	const supabase = await createClient();
	const { error } = await supabase.auth.exchangeCodeForSession(code);

	if (!error) return NextResponse.redirect(new URL("/login?error=confirmation-failed", requestUrl.origin));

	return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
}