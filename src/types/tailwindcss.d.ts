declare module "tailwindcss/lib/util/flattenColorPalette" {
	type ColorPalette = Record<string, string | Record<string, string>>;
	const flattenColorPalette: (colors: ColorPalette) => Record<string, string>;
	export default flattenColorPalette;
}
