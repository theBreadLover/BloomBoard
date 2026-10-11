import type {Metadata} from "next";
import {Inter, Poppins} from "next/font/google";
import "./globals.css";

// Inter powers body copy — descriptions, todo text, notes — chosen for small-size legibility.
const inter = Inter({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800"],
	variable: "--font-inter",
});

// Poppins powers headings, buttons, badges, and tabs — its rounded geometry matches the app's pill shapes.
const poppins = Poppins({
	subsets: ["latin"],
	weight: ["500", "600", "700", "800"],
	variable: "--font-poppins",
});

export const metadata: Metadata = {
	title: "Project Tracker",
	description: "Track your personal projects: status, todos, notes, and work time.",
};

/**
 * Root layout shared by every page: loads both fonts as CSS variables and sets
 * the app's dark pink theme background/text colors (locked in from the V5 design log).
 */
export default function RootLayout({children}: { children: React.ReactNode }): JSX.Element {
	return (
		<html lang="en"
					className={`${inter.variable} ${poppins.variable}`}>
		<body className="min-h-screen bg-brandBg font-sans text-brandText">{children}</body>
		</html>
	);
}