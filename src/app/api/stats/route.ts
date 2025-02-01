import { NextResponse } from "next/server";

const USER_ID = "31mfwctmusrgnxl6tm3t7m2sl6mu";
const range = "weeks";

export async function GET() {
	try {
		const [artistsRes, tracksRes] = await Promise.all([
			fetch(
				`https://api.stats.fm/api/v1/users/${USER_ID}/top/artists?range=${range}`,
			),
			fetch(
				`https://api.stats.fm/api/v1/users/${USER_ID}/top/tracks?range=${range}`,
			),
		]);

		const artists = await artistsRes.json();
		const tracks = await tracksRes.json();

		return NextResponse.json({ artists, tracks });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch music stats ERROR: " + error },
			{ status: 500 },
		);
	}
}
