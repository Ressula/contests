import { NextResponse } from 'next/server';
import { fetchContestHTML } from '@/lib/fetcher';
import { parseContestHTML } from '@/lib/parser';
import { cache } from '@/lib/cache';
import { ContestData } from '@/lib/types';

export async function GET() {
  try {
    // Check cache first
    const cached = cache.get<ContestData>('contests');

    if (cached) {
      return NextResponse.json(cached);
    }

    // Fetch fresh data
    const html = await fetchContestHTML();
    const contests = parseContestHTML(html);

    const data: ContestData = {
      ...contests,
      lastUpdated: Date.now(),
    };

    // Cache for 1 hour (3600 seconds)
    cache.set('contests', data, 3600);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching contests:', error);

    // Try to return stale cache if available
    const staleCache = cache.get<ContestData>('contests');

    if (staleCache) {
      return NextResponse.json({
        ...staleCache,
        error: 'Using cached data due to fetch error',
      });
    }

    // Return error response
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch contests',
        codeforces: [],
        atcoder: [],
        luogu: [],
        lastUpdated: Date.now(),
      },
      { status: 500 }
    );
  }
}
