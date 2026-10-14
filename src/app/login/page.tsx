"use client";

import {useActionState} from "react";
import {sendMagicLink, type SendMagicLinkState} from "./actions";

const initialState: SendMagicLinkState = {message: ""};

/**
 * The sign-in page: a single email field that sends a passwordless magic
 * link, since BloomBoard is a personal, single-user app.
 */
export default function LoginPage() {
	const [state, formAction, isPending] = useActionState(sendMagicLink, initialState);

	return (
		<div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center p-6">
			<h1 className="font-heading text-2xl font-bold text-brandText">Sign in to BloomBoard</h1>
			<p className="mt-2 text-sm text-brandTextMuted">
				Enter your email and we&apos;ll send you a magic sign-in link — no password needed.
			</p>

			<form action={formAction}
			      className="mt-6 flex flex-col gap-3">
				<input
					type="email"
					name="email"
					required
					placeholder="you@example.com"
					className="rounded-lg border border-brandBorder bg-brandSurface px-3 py-2 text-sm text-brandText placeholder:text-brandTextFaint focus:outline-none"
				/>
				<button
					type="submit"
					disabled={isPending}
					className="rounded-lg bg-brandAccent px-3 py-2 font-heading text-sm font-bold text-brandAccentContrast transition disabled:opacity-60"
				>
					{isPending ? "Sending…" : "Send magic link"}
				</button>
			</form>

			{state.message && <p className="mt-4 text-sm text-brandTextMuted">{state.message}</p>}
		</div>
	);
}