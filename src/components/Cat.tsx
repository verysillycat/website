import Image from "next/image";

export default function Cat() {
	return (
		<Image
			src="/assets/cat.gif"
			className={"pixel-cat non-selectable fadeIn"}
			alt="pixel cat"
			width={500}
			height={500}
			priority
			unoptimized
		/>
	);
}
