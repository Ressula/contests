import { ContestData } from '@/lib/types';
import CopyButton from './CopyButton';

// Revalidate every hour (3600 seconds)
export const revalidate = 3600;

async function getContests(): Promise<ContestData> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/contests`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch contests');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching contests:', error);
    return {
      codeforces: [],
      atcoder: [],
      luogu: [],
      lastUpdated: Date.now(),
    };
  }
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function Home() {
  const data = await getContests();

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">本周赛事预告~</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            最后更新: {formatDate(data.lastUpdated)}
          </p>
        </div>
        <CopyButton data={data} />
      </div>

      {/* Codeforces Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">
          Codeforces:
        </h2>
        {data.codeforces.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 ml-4">暂无比赛</p>
        ) : (
          <div className="space-y-2">
            {data.codeforces.map((contest) => (
              <div
                key={contest.id}
                className="ml-4 font-mono text-sm hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded transition-colors"
              >
                <span className="font-medium">{contest.name}</span>
                <span className="text-gray-600 dark:text-gray-400 ml-4">
                  {contest.startTime}
                  {contest.endTime && ` - ${contest.endTime}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AtCoder Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-green-600 dark:text-green-400">
          Atcoder:
        </h2>
        {data.atcoder.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 ml-4">暂无比赛</p>
        ) : (
          <div className="space-y-2">
            {data.atcoder.map((contest) => (
              <div
                key={contest.id}
                className="ml-4 font-mono text-sm hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded transition-colors"
              >
                <span className="font-medium">{contest.name}</span>
                <span className="text-gray-600 dark:text-gray-400 ml-4">
                  {contest.startTime}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Luogu Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-purple-600 dark:text-purple-400">
          Luogu:
        </h2>
        {data.luogu.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 ml-4">暂无比赛</p>
        ) : (
          <div className="space-y-2">
            {data.luogu.map((contest) => (
              <div
                key={contest.id}
                className="ml-4 font-mono text-sm hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded transition-colors"
              >
                <span className="font-medium">{contest.name}</span>
                {contest.type && (
                  <span className="text-gray-500 dark:text-gray-500 ml-4">
                    {contest.type}
                  </span>
                )}
                <span className="text-gray-600 dark:text-gray-400 ml-4">
                  {contest.startTime}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>数据来源: oipage.tommyjin.cn</p>
        <p className="mt-2">每小时自动更新</p>
      </footer>
    </main>
  );
}
