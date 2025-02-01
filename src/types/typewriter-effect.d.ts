declare module "typewriter-effect/dist/core" {
	interface TypewriterOptions {
		cursor?: string;
		delay?: number;
		deleteSpeed?: number;
		loop?: boolean;
	}

	class Typewriter {
		constructor(element: string | HTMLElement, options?: TypewriterOptions);
		typeString(string: string): Typewriter;
		pauseFor(ms: number): Typewriter;
		deleteAll(speed?: number): Typewriter;
		start(): Typewriter;
	}

	export default Typewriter;
}
