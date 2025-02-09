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
				href: "https://github.com/refurbishing",
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
				duration: 0.7,
				ease: [0.2, 0.8, 0.2, 1],
				opacity: { duration: 0.6 },
				y: { duration: 0.6 },
				scale: { duration: 0.7 },
				rotateX: { duration: 0.8 },
			}}
		>
			<Card className="card-background bg-black bg-opacity-25 mt-4 mx-auto py-4 w-[95%] min-w-[320px] max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-2xl xl:max-w-3xl px-4 sm:px-6 border border-[#999a9e]/75 rounded-md relative z-0 transition-all duration-500 ease-out hover:shadow-[0_0_15px_rgba(35,32,32,15)] hover:border-opacity-60 hover:scale-[1.01]">
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
										className={`inline-block relative mr-[0.25em]`}
										initial={{ y: "100%", opacity: 0, filter: "blur(1px)" }}
										animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
										transition={{
											duration: 1.4,
											delay: index * 0.2,
											ease: [0.2, 0.8, 0.2, 1],
											filter: {
												duration: 1.2,
												delay: index * 0.15,
												ease: [0.4, 0, 0.2, 1]
											}
										}}
									>
										<motion.span
											className="inline-block bg-gradient-to-r bg-clip-text text-transparent"
											initial={{ 
												backgroundPosition: "-100%", 
												opacity: 0.5,
												backgroundImage: index === 0 || index === 2
													? "linear-gradient(to right, rgb(229, 231, 235), rgb(209, 213, 219), rgb(229, 231, 235))"
													: "linear-gradient(to right, rgb(161, 161, 170), rgb(212, 212, 216), rgb(161, 161, 170))"
											}}
											animate={{
												backgroundPosition: "200%",
												opacity: 1,
												backgroundImage: index === 1
													? "linear-gradient(to right, rgba(167, 89, 237, 0.90), rgb(216, 180, 254), rgba(167, 89, 237, 0.90))"
													: index === 3
														? "linear-gradient(to right, rgba(96, 165, 250, 0.8), rgb(147, 197, 253), rgba(96, 165, 250, 0.8))"
														: "linear-gradient(to right, rgb(229, 231, 235), rgb(209, 213, 219), rgb(229, 231, 235))"
											}}
											transition={{
												duration: 2.5,
												delay: index * 0.25 + 0.5,
												ease: "linear",
												repeat: Infinity,
												repeatDelay: 3.5,
												times: [0, 1],
												opacity: {
													duration: 0.6,
													ease: "circOut"
												},
												backgroundImage: {
													delay: index * 0.25 + 0.5,
													duration: 1.2,
													ease: [0.22, 1, 0.36, 1]
												}
											}}
										>
											{text}
										</motion.span>
									</motion.span>

									<motion.div
										className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/25 to-transparent"
										initial={{ scaleX: 0, opacity: 0 }}
										animate={{
											scaleX: 1,
											opacity: [0, 1, 1, 0],
										}}
										transition={{
											duration: 1.4,
											delay: index * 0.2,
											ease: [0.2, 0.8, 0.2, 1],
											opacity: {
												times: [0, 0.3, 0.7, 1],
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
										scale: 1.03,
										transition: { 
											duration: 0.3,
											ease: "easeOut"
										} 
									}}
									whileTap={{ 
										scale: 0.97,
										transition: { 
											duration: 0.2 
										} 
									}}
									animate={{ 
										y: 0, 
										opacity: 1,
										transition: {
											type: "spring",
											stiffness: 100,
											damping: 15,
											delay: 0.5 + i * 0.1
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
