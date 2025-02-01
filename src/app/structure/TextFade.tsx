"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextFade = ({
	words,
	className,
	filter = true,
	duration = 0.5,
}: {
	words: string;
	className?: string;
	filter?: boolean;
	duration?: number;
}) => {
	const [scope, animate] = useAnimate();
	useEffect(() => {
		animate(
			"span",
			{
				opacity: 1,
				filter: filter ? "blur(0px)" : "none",
			},
			{
				duration: duration ? duration : 1,
				delay: stagger(0.2),
			},
		);
	}, [animate, duration, filter]);

	const renderWords = () => {
		return (
			<motion.div ref={scope}>
				<motion.span
					className="opacity-0"
					style={{
						filter: filter ? "blur(10px)" : "none",
					}}
				>
					{words}
				</motion.span>
			</motion.div>
		);
	};

	return (
		<div className={cn("font-bold", className)}>
			<div className="mt-4">
				<div className="leading-snug tracking-wide">{renderWords()}</div>
			</div>
		</div>
	);
};
