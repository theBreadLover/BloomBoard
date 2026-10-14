import type {Config} from "tailwindcss";

const config: Config = {
	content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			colors: {
				brandBg: "#160c12",
				brandSurface: "#221119",
				brandBorder: "#3d2130",
				brandText: "#f5e8ef",
				brandTextMuted: "#c6a0b4",
				brandTextFaint: "#8f6b7d",
				brandAccent: "#f472b6",
				brandAccentDark: "#ec4899",
				brandAccentLight: "#3c1c2d",
				brandAccentContrast: "#1a0a12",

				// Fixed semantic status colors — do not change with theme.
				statusWorkingBg: "rgba(16, 185, 129, 0.18)",
				statusWorkingText: "#6ee7b7",
				statusWorkingDot: "#34d399",
				statusPostponedBg: "rgba(245, 158, 11, 0.18)",
				statusPostponedText: "#fcd34d",
				statusPostponedDot: "#fbbf24",
				statusFinishedBg: "rgba(148, 163, 184, 0.18)",
				statusFinishedText: "#cbd5e1",
				statusFinishedDot: "#94a3b8",
				statusAbandonedBg: "rgba(248, 113, 113, 0.18)",
				statusAbandonedText: "#fca5a5",
				statusAbandonedDot: "#f87171",
			},
			fontFamily: {
				sans: ["var(--font-inter)", "system-ui", "sans-serif"],
				heading: ["var(--font-poppins)", "system-ui", "sans-serif"],
			},
		},
	},
	plugins: [],
};

export default config;