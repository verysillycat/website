import "./globals.css";
import { SocketProvider } from "@/hooks/SocketContext";

export const metadata = {
	title: "Cortex",
	description: "designer, developer and web artist",
	openGraph: {
		title: "Cortex",
		description: "designer, developer and web artist",
		url: "https://cortex.rest",
		images: [
			{ 
				url: "https://cortex.rest/assets/embed.png",
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
				<meta name="theme-color" content="#232121" />
			</head>
			<body className="min-h-screen flex flex-col">
				<SocketProvider>
					{children}
				</SocketProvider>
			</body>
		</html>
	);
}
