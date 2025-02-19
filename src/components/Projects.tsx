"use client";
import { Card, CardHeader, CardBody } from "@heroui/react";
import { motion } from "framer-motion";
import { TextFade } from "../app/structure/TextFade";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { useInview } from "../lib/animateInscroll";

const projects = [
	{
		name: "Equibop",
		description:
			"A custom Discord App aiming to give you better performance and improvements forked from Vesktop",
		url: "https://github.com/Equicord/Equibop",
		icon: "https://github.com/Equicord/Equibop/raw/main/static/icon.png",
		language: "TypeScript",
	},
	{
		name: "VNREZ",
		description:
			"Utility-suite for recording and screenshotting your files easily and uploading them to a file host",
		url: "https://github.com/refurbishing/vnrez",
		icon: "https://github.com/refurbishing/vnrez/raw/main/assets/logo.png",
		language: "Bash",
	},
];

interface GitHubRepo {
	stargazers_count: number;
}

export default function Projects() {
	const [stars, setStars] = useState<{ [key: string]: number }>({});
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInview(ref);

	useEffect(() => {
		projects.forEach((project) => {
			const match = project.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
			if (match) {
				const [, owner, repo] = match;
				fetch(`https://api.github.com/repos/${owner}/${repo}`)
					.then((res) => res.json())
					.then((data: GitHubRepo) => {
						setStars((prev) => ({
							...prev,
							[project.url]: data.stargazers_count,
						}));
					})
					.catch(console.error);
			}
		});
	}, []);

	return (
		<div
			id="projects-section"
			ref={ref}
			className="mt-10 flex flex-col items-center"
		>
			<TextFade
				duration={2.25}
				words="Projects"
				className="text-xl font-bold text-white/90"
			/>

			<div
				className={`grid ${
					projects.length < 3
						? "grid-cols-1 sm:grid-cols-2 max-w-[750px]"
						: "grid-cols-1 sm:grid-cols-2 max-w-[750px] [&>*:last-child:nth-child(odd)]:col-span-2 [&>*:last-child:nth-child(odd)]:sm:col-span-2 [&>*:last-child:nth-child(odd)]:sm:w-1/2 [&>*:last-child:nth-child(odd)]:sm:mx-auto"
				} gap-6 mb-1 mx-auto w-[95%] p-4 justify-center`}
			>
				{projects.map((project, index) => (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 25 }}
						animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
						transition={{
							opacity: { duration: 0.8, delay: isInView ? index * 0.2 : 0 },
							y: {
								duration: 0.65,
								delay: isInView ? index * 0.2 : 0,
								ease: [0.2, 0.8, 0.2, 1],
							},
							ease: "easeOut",
						}}
					>
						<Card className="bg-black bg-opacity-25 backdrop-blur-[1.5px] border border-[#999a9e]/75 rounded-md relative z-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-[0_0_10px_rgba(35,32,32,15)] hover:border-opacity-60 hover:scale-[1.02] hover:backdrop-blur-none">
							<CardHeader className="px-4 pt-4 flex gap-3 justify-between">
								<div className="flex gap-2.5 items-center">
									{project.icon && (
										<Image
											src={project.icon}
											alt={`${project.name} icon`}
											width={32}
											height={32}
											className="w-9 h-9 object-contain transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110"
										/>
									)}
									<div>
										<div className="flex items-center gap-3">
											<h2 className="text-lg font-bold tracking-tight text-white">
												{project.name}
											</h2>
											{project.url.includes("github.com") &&
												stars[project.url] !== undefined && (
													<div className="border border-[#999a9e]/10 non-selectable flex items-center gap-1 text-sm text-gray-400 bg-zinc-900/50 px-2 py-0.5 rounded-full transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-105 hover:shadow-[0_0_2px_rgba(255,255,255,0.08)]">
														<svg
															className="w-3.5 h-3.5 fill-current text-amber-400"
															viewBox="0 0 16 16"
														>
															<path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
														</svg>
														{stars[project.url]}
													</div>
												)}
										</div>
									</div>
								</div>
								<a
									href={project.url}
									target="_blank"
									rel="noopener noreferrer"
									className="outline outline-1 outline-[#999a9e]/20 non-selectable flex bg-zinc-900 p-2 rounded-full transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-zinc-800 hover:scale-110 overflow-visible"
								>
									{project.url.includes("github.com") ? (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="fill-blue-100 h-4 w-4 mx-auto overflow-visible"
											viewBox="0 0 16 16"
										>
											<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
										</svg>
									) : (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="fill-blue-100 h-4 w-4 mx-auto overflow-visible"
											viewBox="0 0 16 16"
										>
											<path
												fillRule="evenodd"
												d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"
											/>
											<path
												fillRule="evenodd"
												d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"
											/>
										</svg>
									)}
								</a>
							</CardHeader>
							<CardBody className="px-4 py-1 pb-4">
								<p className="text-gray-300 text-sm mb-3 -mt-2">
									{project.description}
								</p>
								{project.language && (
									<div className="border border-[#999a9e]/10 non-selectable flex items-center gap-1 text-xs text-gray-400 bg-zinc-900/50 px-2 py-0.5 rounded-full w-fit transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-105 hover:shadow-[0_0_2px_rgba(255,255,255,0.08)]">
										<Icon
											icon={`devicon-plain:${project.language.toLowerCase()}`}
											className="w-3.5 h-4"
										/>
										<span>{project.language}</span>
									</div>
								)}
							</CardBody>
						</Card>
					</motion.div>
				))}
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
				transition={{
					duration: 0.5,
					delay: isInView ? 1.2 : 0,
				}}
			>
				<TextFade
					duration={1.4}
					words="... and have contributed to multiple frontend projects"
					className="text-sm text-gray-400 mb-16 italic text-center w-full px-3"
				/>
			</motion.div>
		</div>
	);
}
