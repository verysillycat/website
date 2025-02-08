"use client";
import { Card, CardHeader, CardBody } from "@heroui/react";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo, useRef } from "react";
import Typewriter from "typewriter-effect/dist/core";
import { Code } from "lucide-react";
import { TextFade } from "../app/structure/TextFade";
import { useInview } from "../lib/animateInscroll";

export default function About() {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInview(ref);

	return (
		<div id="about" className="flex justify-center items-center mt-10" ref={ref}>
			<div className="flex flex-col items-center">
				<motion.div
					initial={{ opacity: 0, y: -5 }}
					animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -5 }}
					transition={{ duration: 0.2, ease: "easeInOut" }}
				>
					<TextFade
						duration={1.85}
						words="About Me"
						className="text-2xl font-bold text-white/90"
					/>
				</motion.div>
    
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
					transition={{ duration: 0.5, ease: "easeInOut" }}
				>
					<Card className="backdrop-blur-[1.5px] bg-black/25 mt-4 mx-auto py-4 w-[95%] min-w-[320px] max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl px-4 sm:px-6 border border-[#999a9e]/75 rounded-md relative z-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-[1.02] hover:shadow-[0_0_10px_rgba(35,32,32,15)] hover:border-opacity-60 hover:backdrop-blur-none will-change-transform overflow-hidden origin-center">
						<video
							className="absolute inset-0 w-full h-full object-cover opacity-45 -z-10"
							autoPlay
							loop
							muted
							playsInline
						>
							<source src="/assets/about.mp4" type="video/mp4" />
						</video>
						<div className="relative z-10">
							<CardHeader className="flex flex-col sm:flex-row items-center gap-4">
								<motion.div
									whileHover={{ 
										scale: 1.03,
										boxShadow: "0 0 2px rgba(255, 255, 255, 0.08)" 
									}}
									whileTap={{ scale: 0.98 }}
									transition={{ 
										type: "tween",
										ease: [0.4, 0, 0.2, 1],
										duration: 0.3 
									}}
									className="text-white text-sm flex-[1.5] bg-white/[0.01] backdrop-blur-sm px-3 py-1 rounded-2xl shadow-lg border border-white/[0.02]"
								>
									In my early teen years, I developed an interest in programming,
									design and cybersecurity which led me to pursue a career in the field
                 					which I have a passion for and I'm always looking to
									learn more and to make a difference.
								</motion.div>
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={isInView ? { opacity: 1, y: 0 } : {}}
									transition={{ duration: 0.5, ease: "easeInOut" }}
								>
									<div className="block sm:hidden w-56 h-[1px] my-4 mx-auto bg-gradient-to-r from-transparent via-[#dbdbdb] to-transparent opacity-50 relative">
										<div className="absolute w-16 h-[3px] bg-white/20 blur-sm -top-[1px]" />
									</div>
									<div className="hidden sm:block w-auto h-28 my-2 justify-center sm:ml-8">
										<div className="h-full w-[1px] bg-gradient-to-b from-transparent via-[#dbdbdb] to-transparent opacity-50 relative">
											<div className="absolute h-8 w-[3px] bg-white/20 blur-sm -left-[1px]" />
										</div>
									</div>
								</motion.div>
								<div className="flex-1 sm:ml-8 text-center sm:text-left">
									<motion.div
										whileHover={{ 
											scale: 1.03,
											boxShadow: "0 0 2px rgba(255, 255, 255, 0.08)" 
										}}
										whileTap={{ scale: 0.98 }}
										transition={{ 
											type: "tween",
											ease: [0.4, 0, 0.2, 1],
											duration: 0.3 
										}}
										className="text-white text-xs flex-[1.5] bg-white/[0.01] backdrop-blur-sm px-3 py-1 rounded-2xl shadow-lg border border-white/[0.02]"
									>
										Currently focused on Web Development
										and always exploring new technologies
										to enhance and improve my skill set.
									</motion.div>
									<motion.div
										whileHover={{ 
											scale: 1.03,
											boxShadow: "0 0 2px rgba(255, 255, 255, 0.08)" 
										}}
										whileTap={{ scale: 0.98 }}
										className="flex items-center justify-center sm:justify-start gap-1.5 bg-white/[0.03] w-fit px-2.5 py-1 rounded-md mt-3 mx-auto sm:mx-0 border border-white/[0.03]"
									>
										<div className="bg-white/[0.06] p-0.5 rounded-md border border-white/[0.03]">
											<Code className="w-3.5 h-3.5 text-white/80" />
										</div>
										<span className="text-white/80 text-xs">~2 Years of Experience</span>
									</motion.div>
								</div>
							</CardHeader>
						</div>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}
