import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
	title: "Cortex",
	description: "designer, developer and web artist",
	openGraph: {
		title: "Cortex",
		description: "designer, developer and web artist",
		url: "https://cortex.rest",
		images: [
			{ 
				url: "https://cortex.rest/assets/embed.gif",
				width: 528,
				height: 511,
			},
		],
	},
};

export default function RootLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta name="darkreader-lock" />
				<meta name="theme-color" content="#686868" />
			</head>
				<body className="min-h-screen flex flex-col">
				<SpeedInsights />
					{children}
				<Analytics />
			</body>
		</html>
	);
}
