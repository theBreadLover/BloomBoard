import type {Metadata} from "next";
import {Inter, Poppins} from "next/font/google";
import AppHeader from "@/components/AppHeader";
import "./globals.css";

// Inter powers body copy — descriptions, todo text, notes — chosen for small-size legibility.
const inter = Inter({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800"],
	variable: "--font-inter",
});

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["500", "600", "700", "800"],
	variable: "--font-poppins",
});

export const metadata: Metadata = {
	title: "BloomBoard",
	description:
		"BloomBoard — a personal dashboard for tracking side projects: status, todos, notes, and a daily work-habit nudge.",
};

/**
 * Root layout shared by every page: loads both fonts as CSS variables, shows
 * the BloomBoard brand header, and sets the app's dark pink theme
 * background/text colors (locked in from the V5 design log).
 */
export default function RootLayout({children}: { children: React.ReactNode }) {
	return (
		<html lang="en"
		      className={`${inter.variable} ${poppins.variable}`}>
		<body className="min-h-screen bg-brandBg font-sans text-brandText">
		<AppHeader/>
		{children}
		</body>
		</html>
	);
}