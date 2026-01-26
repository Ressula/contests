import { Contest } from './types';

export function formatContests(contests: {
  codeforces: Contest[];
  atcoder: Contest[];
  luogu: Contest[];
}): string {
  let output = '本周赛事预告~\n\n';

  // Format Codeforces
  output += 'Codeforces:\n';
  if (contests.codeforces.length === 0) {
    output += '暂无比赛\n';
  } else {
    contests.codeforces.forEach(contest => {
      const timeRange = contest.endTime
        ? `${contest.startTime}-${contest.endTime}`
        : contest.startTime;
      output += `${contest.name}  ${timeRange}\n`;
    });
  }
  output += '\n';

  // Format AtCoder
  output += 'Atcoder:\n';
  if (contests.atcoder.length === 0) {
    output += '暂无比赛\n';
  } else {
    contests.atcoder.forEach(contest => {
      output += `${contest.name} ${contest.startTime}\n`;
    });
  }
  output += '\n';

  // Format Luogu
  output += 'Luogu:\n';
  if (contests.luogu.length === 0) {
    output += '暂无比赛\n';
  } else {
    contests.luogu.forEach(contest => {
      const type = contest.type ? `\t${contest.type}` : '';
      output += `${contest.name}${type}\t${contest.startTime}\n`;
    });
  }

  return output;
}
