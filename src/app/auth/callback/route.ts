import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

/**
 * Handles the redirect from a Supabase magic-link email: exchanges the
 * one-time code for a real signed-in session, then sends the user back
 * into the app.
 */
export async function GET(request: Request): Promise<Response> {
	const {searchParams, origin} = new URL(request.url);
	const token: string | null = searchParams.get("token")?.split('_')[1] ?? null;
	const redirectTarget = searchParams.get("next") ?? "/";

	if (token) {
		const supabase = await createClient();
		const {error} = await supabase.auth.exchangeCodeForSession(token);
		if (!error) {
			return NextResponse.redirect(`${origin}${redirectTarget}`);
		}
	}

	return NextResponse.redirect(`${origin}/login?error=auth`);
}