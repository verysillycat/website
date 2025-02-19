import { NextResponse } from "next/server";

let lastSuccessfulResponse: any = null;
let lastRequestTime: number = 0;
const RATE_LIMIT_WINDOW = 120 * 60 * 1000;
export async function GET() {
	try {
		const now = Date.now();
		if (lastRequestTime && now - lastRequestTime < RATE_LIMIT_WINDOW) {
			if (lastSuccessfulResponse) {
				return NextResponse.json(lastSuccessfulResponse);
			}
		} else {
			lastSuccessfulResponse = null;
		}

		lastRequestTime = now;

		const contributionsRes = await fetch(
			// "https://corsproxy.io/?url=https://github-contributions-api.jogruber.de/v4/refurbishing?y=last",
			"https://github-contributions-api.jogruber.de/v4/refurbishing?y=last",
			{ next: { revalidate: 18000 } }, // Cache for 5 hours
		);
		const contributionsData = await contributionsRes.json();
		const reposRes = await fetch(
			"https://api.github.com/users/refurbishing/repos",
			{
				headers: {
					Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
					Accept: "application/vnd.github.v3+json",
				},
				next: { revalidate: 18000 }, // Cache for 5 hours
			},
		);
		if (!reposRes.ok) {
			throw new Error(`GitHub API error: ${reposRes.status}`);
		}
		const repos = await reposRes.json();

		if (!Array.isArray(repos)) {
			throw new Error("Unexpected response format from GitHub API");
		}

		const filteredRepos = repos.filter(
			(repo) => !repo.fork || repo.full_name === "refurbishing/dots-hyprland",
		);

		const languagePromises = filteredRepos.map((repo) =>
			fetch(repo.languages_url, { next: { revalidate: 18000 } }).then((res) =>
				res.json(),
			),
		);
		const languageData = await Promise.all(languagePromises);

		const aggregatedLanguages: { [key: string]: number } = {};
		languageData.forEach((repoLangs: { [key: string]: number }) => {
			Object.entries(repoLangs).forEach(([lang, bytes]) => {
				aggregatedLanguages[lang] = (aggregatedLanguages[lang] || 0) + bytes;
			});
		});
		lastSuccessfulResponse = {
			contributions: contributionsData.contributions,
			total: contributionsData.total.lastYear,
			languages: aggregatedLanguages,
		};

		return NextResponse.json(lastSuccessfulResponse);
	} catch (error) {
		console.error("API Error:", error);
		const now = Date.now();
		if (lastSuccessfulResponse && now - lastRequestTime < RATE_LIMIT_WINDOW) {
			return NextResponse.json(lastSuccessfulResponse);
		}
		lastSuccessfulResponse = null;
		return NextResponse.json(
			{
				error:
					"Failed to fetch GitHub data. Possible Ratelimit try again later.",
			},
			{ status: 500 },
		);
	}
}
