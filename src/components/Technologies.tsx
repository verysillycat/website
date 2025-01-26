"use client";

import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Slider } from "../app/structure/Slider";
import { TextFade } from "../app/structure/TextFade";
import { motion } from "framer-motion";

export default function Technologies() {
	const technologies = [
		{ href: "https://nextjs.org", icon: "simple-icons:nextdotjs", name: "Next.js" },
		{ href: "https://astro.build", icon: "simple-icons:astro", name: "Astro" },
		{ href: "https://www.typescriptlang.org", icon: "simple-icons:typescript", name: "TypeScript" },
		{ href: "https://www.w3.org/Style/CSS/", icon: "simple-icons:css3", name: "CSS" },
		{ href: "https://www.gnu.org/software/bash/", icon: "simple-icons:gnubash", name: "Bash" },
		{ href: "https://www.python.org", icon: "simple-icons:python", name: "Python" },
		{ href: "https://pnpm.io", icon: "simple-icons:pnpm", name: "pnpm" },
		{ href: "https://www.kernel.org", icon: "simple-icons:linux", name: "Linux" },
		{ href: "https://www.markdownguide.org", icon: "simple-icons:markdown", name: "Markdown" },
	];

	return (
		<div id="technologies" className="flex justify-center items-center mt-10">
			<div className="flex flex-col items-center">
				<motion.div
					initial={{ opacity: 0, y: -5 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.2, ease: "easeInOut" }}
				>
					<TextFade
						duration={1}
						words="Technologies"
						className="text-xl font-bold text-white"
					/>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: "easeInOut" }}
				>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, ease: "easeInOut" }}
					>
						<Card className="relative mx-4 mt-3 w-auto max-w-4xl overflow-visible bg-black bg-opacity-20 py-0.5 border border-[#dbdbdb] rounded-md transition-all duration-300 ease-in-out hover:shadow-[0_0_10px_rgba(35,32,32,15)] hover:border-opacity-60 slider-fade">
							<CardBody className="overflow-visible px-0">
								<div
									className="pointer-events-none absolute inset-0"
									style={{ zIndex: 0 }}
								></div>
								<Slider>
									<div className="font-semibold flex justify-center gap-4 px-4 -mr-8">
										{technologies.map((tech) => (
											<a
												key={tech.name}
												href={tech.href}
												target="_blank"
												className="hover-effect shrink-0"
											>
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{
														duration: 0.5,
														ease: "easeOut"
													}}
													className="border-[#bfbfbf] flex items-center gap-2 rounded-lg border bg-black bg-opacity-25 px-3 py-2 whitespace-nowrap"
												>
													<Icon
														icon={tech.icon}
														className="h-6 w-6 text-[#b7b7b7]"
														aria-label={`${tech.name}`}
													/>
													<span className="text-gray-300">{tech.name}</span>
												</motion.div>
											</a>
										))}
									</div>
								</Slider>
							</CardBody>
						</Card>
					</motion.div>
				</motion.div>
			</div>
		</div>
	);
}
