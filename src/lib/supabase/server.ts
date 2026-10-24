import {cookies} from "next/headers";
import {createServerClient} from "@supabase/ssr";

/**
 * Creates a Supabase client for use on the server (Server Components, Route
 * Handlers, and Server Actions). Reads/writes the auth session via cookies,
 * so the signed-in user carries over from the browser automatically.
 */
export async function createClient() {
	const cookieStore = await cookies();

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({name, value, options}) => cookieStore.set(name, value, options));
					} catch {
						// Called from a Server Component that can't set cookies directly — safe to
						// ignore here because the middleware below refreshes the session on every request.
					}
				},
			},
		},
	);
}