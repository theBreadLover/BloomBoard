"use server";
import { redirect } from "next/navigation";
import {createClient} from "@/lib/supabase/server";

export interface AuthenticationFormState {
	message: string;
	status: "idle" | "error" | "success";
}


/**
 * Parse and transform the credentials
 * before sending them to the server.
 * @param formData - The form where the data was introduced.
 * @returns The filtered credentials.
 */
function readCredentials(formData: FormData) {
	const email = String(formData.get("email") ?? "")
		.trim()
		.toLowerCase();

	const password = String(formData.get("password") ?? "")

	return { email, password };
}

/**
 * Check if the form is missing any parameters.
 * and validates only if a password has a minimum length.
 * @param email - the email linked to the user's account.
 * @param password - A unique password that must be at least 8 characters long
 * @returns An error status along with a message explaining an error, otherwhise null.
 */
function validateCredentials(email: string, password: string): AuthenticationFormState | null {
	if (!email) return {message: "email is required", status: "error"};
	if (!password) return {message: "password is required", status: "error"};
	if (password.length < 8) return {message: "password must be at least 8 characters", status: "error"};
	return null;
}

export async function signUp(_previousState: AuthenticationFormState, formData: FormData): Promise<AuthenticationFormState> {
	const { email, password } = readCredentials(formData);
	const validationError = validateCredentials(email, password);
	if (validationError) return validationError;

	const confirmPassword = String(formData.get("confirmPassword") ?? "");
	if (password !== confirmPassword) return {message: "passwords do not match", status: "error"};
	const siteUrl: string = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

	const supabase = await createClient();
	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			emailRedirectTo: `${siteUrl}/auth/callback`,
		}
	})
	if (error) return {message: error.message, status: "error"};
	return {message: "Account created, check your email to verify your account.", status: "success"};
}

export async function signIn(_previousState: AuthenticationFormState, formData: FormData): Promise<AuthenticationFormState> {
	const { email, password } = readCredentials(formData);
	const validationError = validateCredentials(email, password);
	if (validationError) return validationError;

	const supabase = await createClient();
	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});
	if (error) return {message: "The email or password is incorrect.", status: "error"};

	redirect("/");
}