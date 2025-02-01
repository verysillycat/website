import React from "react";

export const Slider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return (
		<div className="relative flex max-w-[90vw] overflow-hidden py-0.5">
			<div className="flex w-max animate-slider [--duration:30s] gap-4 [&:has(.hover-effect:hover)]:pause-animation">
				{children}
				{children}
			</div>
		</div>
	);
};
