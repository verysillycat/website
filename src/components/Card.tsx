"use client";
import { Card, CardHeader, CardBody } from "@heroui/react";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import Typewriter from "typewriter-effect/dist/core";
import { Icon, loadIcon } from "@iconify/react";
import { shuffledQuotes } from "@/data/quotes";
import Image from "next/image";

export default function CardComponent() {
	const [iconsLoaded, setIconsLoaded] = useState(false);

	const socialLinks = useMemo(
		() => [
			{
				href: "https://t.me/backdropped",
				icon: "mdi:telegram",
				alt: "Telegram",
			},
			{
				href: "https://github.com/verysillycat",
				icon: "mdi:github",
				alt: "GitHub",
			},
			{
				href: "https://steamcommunity.com/id/webassembly",
				icon: "mdi:steam",
				alt: "Steam",
			},
			{
				href: "https://stats.fm/Cortex",
				icon: "/assets/statsfm.png",
				alt: "stats.fm",
			},
		],
		[],
	);

	useEffect(() => {
		setTimeout(() => {
			const typewriter = new Typewriter("#typewriter", {
				cursor: "|",
				delay: 70,
				loop: true,
			});

			shuffledQuotes
				.reduce(
					(tw, quote) => tw.typeString(quote).pauseFor(1500).deleteAll(),
					typewriter,
				)
				.start();
		}, 500);
	}, []);

	useEffect(() => {
		const loadIcons = async () => {
			try {
				await Promise.all(
					socialLinks
						.filter((link) => !link.icon.startsWith("/"))
						.map((link) => loadIcon(link.icon)),
				);
				setIconsLoaded(true);
			} catch (error) {
				console.error("Failed to load card icons:", error);
				setIconsLoaded(true);
			}
		};

		loadIcons();
	}, [socialLinks]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20, scale: 0.98, rotateX: -10 }}
			animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
			transition={{
				duration: 0.5,
				ease: [0.23, 1, 0.32, 1],
				opacity: { duration: 0.4 },
				y: { duration: 0.4 },
				scale: { duration: 0.5 },
				rotateX: { duration: 0.6 },
			}}
		>
			<Card className="card-background bg-black bg-opacity-25 mt-4 mx-auto py-4 w-[95%] min-w-[320px] max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-2xl xl:max-w-3xl px-4 sm:px-6 border border-[#999a9e]/75 rounded-md relative z-0 transition-all duration-300 ease-in-out hover:shadow-[0_0_10px_rgba(35,32,32,15)] hover:border-opacity-60 hover:scale-[1.02]">
				<video autoPlay loop muted playsInline disablePictureInPicture>
					<source src="/assets/banner.mp4" type="video/mp4" />
					Your browser does not support the video tag.
				</video>
				<CardHeader className="pb-2">
					<h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white overflow-hidden">
						{["I'm a", "15 year old", "developer from", "Honduras"].map(
							(text, index) => (
								<div key={index} className="relative inline-block">
									<motion.span
										className={`inline-block relative mr-[0.25em] ${
											index === 1
												? "text-purple-300"
												: index === 3
													? "text-blue-300"
													: ""
										}`}
										initial={{ y: "100%", opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										transition={{
											duration: 1.2,
											delay: index * 0.25,
											ease: [0.22, 1, 0.36, 1],
										}}
									>
										<motion.span
											className={`inline-block ${
												index === 1
													? "bg-gradient-to-r from-purple-400/80 via-purple-300 to-purple-400/80"
													: index === 3
														? "bg-gradient-to-r from-blue-400/80 via-blue-300 to-blue-400/80"
														: "bg-gradient-to-r from-white via-gray-300 to-white"
											} bg-clip-text text-transparent`}
											initial={{ backgroundPosition: "-100%" }}
											animate={{ backgroundPosition: "200%" }}
											transition={{
												duration: 2.5,
												delay: index * 0.25 + 1,
												ease: "linear",
												repeat: Infinity,
												repeatDelay: 3.5,
											}}
										>
											{text}
										</motion.span>
									</motion.span>

									<motion.div
										className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent"
										initial={{ scaleX: 0, opacity: 0 }}
										animate={{
											scaleX: 1,
											opacity: [0, 1, 1, 0],
										}}
										transition={{
											duration: 1.2,
											delay: index * 0.25,
											ease: [0.22, 1, 0.36, 1],
											opacity: {
												times: [0, 0.2, 0.8, 1],
											},
										}}
									/>
								</div>
							),
						)}
					</h1>
				</CardHeader>
				<CardBody>
					<p className="font-normal text-gray-200 dark:text-gray-300 leading-tight text-sm sm:text-base">
						<span id="typewriter"></span>
					</p>
					<div className="mr-2 flex justify-end mt-4">
						{iconsLoaded &&
							socialLinks.map((link, i) => (
								<motion.a
									key={link.icon}
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									initial={{ y: -20, opacity: 0 }}
									whileHover={{ 
										y: -2,
										scale: 1.05,
										transition: { 
											duration: 0.15,
											ease: "easeOut"
										} 
									}}
									whileTap={{ 
										scale: 0.95,
										transition: { 
											duration: 0.1 
										} 
									}}
									animate={{ 
										y: 0, 
										opacity: 1,
										transition: {
											type: "tween",
											ease: "easeOut",
											duration: 0.5,
											delay: 0.4 + i * 0.12
										}
									}}
									className="border p-1 rounded-md border-[#999a9e]/45 hover:bg-[#1a1a1a]/60 mr-2 last:mr-0 cursor-pointer will-change-transform">
									{link.icon.startsWith("/") ? (
										<Image
											src={link.icon}
											alt={link.alt}
											width={24}
											height={24}
											className="w-6 h-6 sm:w-7 sm:h-7 text-[#b7b7b7]"
										/>
									) : (
										<Icon
											icon={link.icon}
											className="text-[#b7b7b7] text-2xl sm:text-3xl"
											aria-label={link.alt}
										/>
									)}
								</motion.a>
							))}
					</div>
				</CardBody>
			</Card>
		</motion.div>
	);
}
