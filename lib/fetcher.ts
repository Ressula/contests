interface ContestsGuruContest {
  id: string;
  external_id: string;
  title: string;
  url: string;
  platform: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
}

export async function fetchContestHTML(): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch('https://oipage.tommyjin.cn/', {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    return text;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: Failed to fetch contest data within 10 seconds');
      }
      throw new Error(`Failed to fetch contest data: ${error.message}`);
    }

    throw new Error('Failed to fetch contest data: Unknown error');
  }
}

export async function fetchLuoguContests(): Promise<ContestsGuruContest[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndidHh6ZnphenFibXFyd2RlaHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3OTE5MDgsImV4cCI6MjA4MTM2NzkwOH0.orAbLkg-K5IVoHwG-PKYwNroA_JpB4zV7iNjVqExXqQ';

    const response = await fetch(
      'https://wbtxzfzazqbmqrwdehwm.supabase.co/rest/v1/contests?select=*&order=start_time.asc&limit=500',
      {
        signal: controller.signal,
        headers: {
          'apikey': apikey,
          'Authorization': `Bearer ${apikey}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ContestsGuruContest[] = await response.json();
    return data.filter(c => c.platform === 'luogu.com.cn');
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: Failed to fetch Luogu contests within 10 seconds');
      }
      throw new Error(`Failed to fetch Luogu contests: ${error.message}`);
    }

    throw new Error('Failed to fetch Luogu contests: Unknown error');
  }
}
