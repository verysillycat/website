"use client";

import Image from "next/image";
import { useState } from "react";
import MusicStats from "./MusicStats";

export default function Cat() {
	const [showMusicStats, setShowMusicStats] = useState(false);

	return (
		<div>
			<Image
				src="/assets/cat.gif"
				className={"pixel-cat non-selectable fadeIn"}
				alt="pixel cat"
				width={500}
				height={500}
				priority
				unoptimized
				onClick={() => setShowMusicStats(true)}
				onMouseEnter={(e) => {
					e.currentTarget.style.cursor = "pointer";
					e.currentTarget.style.transform = "scale(1.05)";
					e.currentTarget.style.transition = "transform 0.3s ease-in-out";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.transform = "scale(1)";
					e.currentTarget.style.transition = "transform 0.3s ease-in-out";
				}}
			/>
			<MusicStats
				isOpen={showMusicStats}
				onClose={() => setShowMusicStats(false)}
			/>
		</div>
	);
}
