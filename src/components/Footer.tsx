"use client";
import React from "react";
import { motion } from "framer-motion";

export function Footer() {
	return (
		<motion.footer
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, ease: "easeInOut" }}
			className="bg-dot-white/[0.4] h-[8rem] w-full flex flex-col items-center justify-end overflow-hidden relative [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
		>
			<div className="flex-grow" />
			<div className="w-4/5 h-[2px] mb-2 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full relative" />
			<h1 className="md:text-base text-xs lg:text-sm font-bold text-center text-white relative mb-3 z-10">
				Made with NextJS, TailwindCSS
			</h1>
		</motion.footer>
	);
}
