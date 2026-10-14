"use server";

import {createClient} from "@/lib/supabase/server";

/** The login form's state: just a status message to show the user. */
export interface SendMagicLinkState {
	message: string;
}

/**
 * Sends a Supabase magic-link sign-in email — no password required.
 * @param _previousState - The previous form state (unused — required by useActionState's signature).
 * @param formData - The submitted form, expected to contain an "email" field.
 * @returns The new form state, with a message to show the user.
 */
export async function sendMagicLink(
	_previousState: SendMagicLinkState,
	formData: FormData,
): Promise<SendMagicLinkState> {
	const email = String(formData.get("email") ?? "").trim();
	if (!email) {
		return {message: "Enter an email address."};
	}

	const supabase = await createClient();
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
	const {error} = await supabase.auth.signInWithOtp({
		email,
		options: {emailRedirectTo: `${siteUrl}/auth/callback`},
	});

	if (error) {
		return {message: `Couldn't send the link: ${error.message}`};
	}

	return {message: "Check your email for a sign-in link."};
}