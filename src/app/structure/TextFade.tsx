"use client";
import { useEffect, useRef } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";
import { useInview } from "@/lib/animateInscroll";

export const TextFade = ({
	words,
	className,
	filter = true,
	duration,
	fullLoadedDuration,
}: {
	words: string;
	className?: string;
	filter?: boolean;
	duration?: number;
	fullLoadedDuration?: number;
}) => {
	const [scope, animate] = useAnimate();
	const isInView = useInview(scope);
	const mounted = useRef(false);

	useEffect(() => {
		if (isInView) {
			const currentDuration = !mounted.current 
				? (fullLoadedDuration ?? duration)
				: duration;
				
			animate(
				"span",
				{
					opacity: 1,
					filter: filter ? "blur(0px)" : "none",
				},
				{
					duration: currentDuration,
					delay: stagger(0.2),
				},
			);
		}
		mounted.current = true;
	}, [animate, duration, filter, fullLoadedDuration, isInView]);

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
