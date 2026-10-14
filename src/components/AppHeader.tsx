import {signOut} from "@/app/actions";

/**
 * The app's sticky top bar: the BloomBoard brand mark plus a sign-out
 * control, shown on every page.
 */
export default function AppHeader() {
	return (
		<header className="sticky top-0 z-10 border-b border-brandBorder bg-brandSurface px-5 py-3">
			<div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<span className="h-2.5 w-2.5 rounded-full bg-brandAccent"/>
					<span className="font-heading text-base font-extrabold text-brandText">BloomBoard</span>
				</div>
				<form action={signOut}>
					<button type="submit"
					        className="font-heading text-xs font-semibold text-brandTextMuted hover:text-brandText">
						Sign out
					</button>
				</form>
			</div>
		</header>
	);
}