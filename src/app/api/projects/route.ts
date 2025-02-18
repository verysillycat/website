import { NextResponse } from 'next/server';
import { projects } from '@/components/Projects';

let lastSuccessfulResponse: any = null;
let lastRequestTime: number = 0;
const RATE_LIMIT_WINDOW = 30 * 60 * 1000; // 30 minutes

export async function GET() {
  try {
    const now = Date.now();
    if (lastRequestTime && (now - lastRequestTime) < RATE_LIMIT_WINDOW) {
      if (lastSuccessfulResponse) {
        return NextResponse.json(lastSuccessfulResponse);
      }
    }
    
    lastRequestTime = now;
    const starsData: { [key: string]: number } = {};

    await Promise.all(
      projects.map(async (project) => {
        const match = project.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
          const [, owner, repo] = match;
          const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
              'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json'
            },
            next: { revalidate: 18000 } // Cache for 5 hours
          });
          const data = await response.json();
          starsData[project.url] = data.stargazers_count;
        }
      })
    );

    lastSuccessfulResponse = starsData;
    return NextResponse.json(lastSuccessfulResponse);
    
  } catch (error) {
    if (lastSuccessfulResponse) {
      return NextResponse.json(lastSuccessfulResponse);
    }
    return NextResponse.json(
      { error: 'Failed to fetch GitHub data. Possible Ratelimit try again later.' },
      { status: 500 }
    );
  }
} 