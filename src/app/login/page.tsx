"use client";

import { useActionState, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { type AuthenticationFormState, signIn, signUp } from "./actions";

const initialState: AuthenticationFormState = {
	message: "",
	status: "idle",
};

type AuthMode = "signIn" | "signUp";

function LoginForm() {
	const [mode, setMode] = useState<AuthMode>("signIn");
	const searchParams = useSearchParams();
	const wasConfirmed = searchParams.get("confirmed") === "true";

	const [signInState, signInAction, isSigningIn] = useActionState(
		signIn,
		initialState,
	);

	const [signUpState, signUpAction, isSigningUp] = useActionState(
		signUp,
		initialState,
	);

	const isSignUp = mode === "signUp";
	const state = isSignUp ? signUpState : signInState;
	const formAction = isSignUp ? signUpAction : signInAction;
	const isPending = isSignUp ? isSigningUp : isSigningIn;

	function switchMode(nextMode: AuthMode) {
		setMode(nextMode);
	}

	return (
		<div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center p-6">
			<h1 className="font-heading text-2xl font-bold text-brandText">
				{isSignUp
					? "Create your BloomBoard account"
					: "Sign in to BloomBoard"}
			</h1>
			{wasConfirmed && (
				<p className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300" role="status">
					Your email has been confirmed. You can now sign in.
				</p>
			)}

			<p className="mt-2 text-sm text-brandTextMuted">
				{isSignUp
					? "Create an account to start tracking your projects."
					: "Enter your email and password to continue."}
			</p>

			<div className="mt-6 grid grid-cols-2 rounded-lg border border-brandBorder bg-brandSurface p-1">
				<button
					type="button"
					onClick={() => switchMode("signIn")}
					className={`rounded-md px-3 py-2 font-heading text-sm font-semibold transition ${
						!isSignUp
							? "bg-brandAccent text-brandAccentContrast"
							: "text-brandTextMuted hover:text-brandText"
					}`}
				>
					Sign in
				</button>

				<button
					type="button"
					onClick={() => switchMode("signUp")}
					className={`rounded-md px-3 py-2 font-heading text-sm font-semibold transition ${
						isSignUp
							? "bg-brandAccent text-brandAccentContrast"
							: "text-brandTextMuted hover:text-brandText"
					}`}
				>
					Create account
				</button>
			</div>

			<form
				action={formAction}
				className="mt-5 flex flex-col gap-3"
			>
				<label className="flex flex-col gap-1">
					<span className="text-sm font-medium text-brandText">
						Email
					</span>

					<input
						type="email"
						name="email"
						required
						autoComplete="email"
						placeholder="you@example.com"
						className="rounded-lg border border-brandBorder bg-brandSurface px-3 py-2 text-sm text-brandText placeholder:text-brandTextFaint focus:outline-none"
					/>
				</label>

				<label className="flex flex-col gap-1">
					<span className="text-sm font-medium text-brandText">
						Password
					</span>

					<input
						type="password"
						name="password"
						required
						minLength={8}
						autoComplete={
							isSignUp
								? "new-password"
								: "current-password"
						}
						className="rounded-lg border border-brandBorder bg-brandSurface px-3 py-2 text-sm text-brandText focus:outline-none"
					/>
				</label>

				{isSignUp && (
					<label className="flex flex-col gap-1">
						<span className="text-sm font-medium text-brandText">
							Confirm password
						</span>

						<input
							type="password"
							name="confirmPassword"
							required
							minLength={8}
							autoComplete="new-password"
							className="rounded-lg border border-brandBorder bg-brandSurface px-3 py-2 text-sm text-brandText focus:outline-none"
						/>
					</label>
				)}

				<button
					type="submit"
					disabled={isPending}
					className="mt-2 rounded-lg bg-brandAccent px-3 py-2 font-heading text-sm font-bold text-brandAccentContrast transition disabled:cursor-not-allowed disabled:opacity-60"
				>
					{isPending
						? isSignUp
							? "Creating account..."
							: "Signing in..."
						: isSignUp
							? "Create account"
							: "Sign in"}
				</button>
			</form>

			{state.message && (
				<p
					role={state.status === "error" ? "alert" : "status"}
					className={`mt-4 text-sm ${
						state.status === "error"
							? "text-red-400"
							: "text-brandTextMuted"
					}`}
				>
					{state.message}
				</p>
			)}
		</div>
	);
}

function LoginFallback() {
	return (
		<div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center p-6">
			<p className="text-sm text-brandTextMuted">
				Loading authentication...
			</p>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense fallback={<LoginFallback />}>
			<LoginForm />
		</Suspense>
	);
}