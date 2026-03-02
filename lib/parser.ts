import * as cheerio from 'cheerio';
import { Contest } from './types';

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

function formatDateTime(dateStr: string): string {
  // Convert "2026-01-29 22:35:00" to "01-29 22:35"
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
  if (match) {
    const [, , month, day, hour, minute] = match;
    return `${month}-${day} ${hour}:${minute}`;
  }
  return dateStr;
}

function addHoursToDateTime(dateStr: string, hours: number): string {
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (match) {
    const [, year, month, day, hour, minute, second] = match;
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );
    date.setHours(date.getHours() + hours);

    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    const newDay = String(date.getDate()).padStart(2, '0');
    const newHour = String(date.getHours()).padStart(2, '0');
    const newMinute = String(date.getMinutes()).padStart(2, '0');

    return `${newMonth}-${newDay} ${newHour}:${newMinute}`;
  }
  return dateStr;
}

function isWithinWeek(dateStr: string): boolean {
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
  if (!match) return false;

  const [, year, month, day, hour, minute] = match;
  const contestDate = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(minute)
  );

  const now = new Date();
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return contestDate >= now && contestDate <= oneWeekLater;
}

export function parseContestHTML(html: string): {
  codeforces: Contest[];
  atcoder: Contest[];
  luogu: Contest[];
} {
  const $ = cheerio.load(html);

  const codeforces: Contest[] = [];
  const atcoder: Contest[] = [];
  const luogu: Contest[] = [];

  // Parse Codeforces contests
  $('h2').each((_, h2) => {
    const text = $(h2).text();
    if (text.includes('Codeforces')) {
      const table = $(h2).next('table');

      table.find('tbody tr').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 3) {
          const name = $(cells[0]).find('a').text().trim();
          const startTime = $(cells[2]).text().trim();
          const duration = parseFloat($(cells[3]).text().trim());

          if (name && startTime && isWithinWeek(startTime)) {
            const formattedStart = formatDateTime(startTime);
            const endTime = !isNaN(duration) ? addHoursToDateTime(startTime, duration) : undefined;

            codeforces.push({
              id: `cf-${codeforces.length}`,
              platform: 'Codeforces',
              name,
              startTime: formattedStart,
              endTime,
            });
          }
        }
      });
    }
  });

  // Parse AtCoder contests
  $('h2').each((_, h2) => {
    const text = $(h2).text();
    if (text.includes('AtCoder')) {
      const table = $(h2).next('table');

      table.find('tbody tr').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 2) {
          const nameHtml = $(cells[0]).find('a').html() || '';
          const name = $('<div>').html(nameHtml).text().trim();
          const startTime = $(cells[1]).text().trim();

          if (name && startTime && isWithinWeek(startTime)) {
            atcoder.push({
              id: `ac-${atcoder.length}`,
              platform: 'AtCoder',
              name,
              startTime: formatDateTime(startTime),
            });
          }
        }
      });
    }
  });

  return { codeforces, atcoder, luogu: [] };
}

export function parseLuoguContests(contests: ContestsGuruContest[]): Contest[] {
  const luogu: Contest[] = [];
  const now = new Date();
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  for (const contest of contests) {
    // Parse UTC time and convert to China timezone (UTC+8)
    const startTime = new Date(contest.start_time);
    const endTime = new Date(contest.end_time);

    if (startTime >= now && startTime <= oneWeekLater) {
      // Format to "MM-DD HH:mm" in China timezone
      const formatTime = (date: Date) => {
        // Convert to China timezone by adding 8 hours
        const chinaTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
        const month = String(chinaTime.getUTCMonth() + 1).padStart(2, '0');
        const day = String(chinaTime.getUTCDate()).padStart(2, '0');
        const hour = String(chinaTime.getUTCHours()).padStart(2, '0');
        const minute = String(chinaTime.getUTCMinutes()).padStart(2, '0');
        return `${month}-${day} ${hour}:${minute}`;
      };

      const formattedStart = formatTime(startTime);
      const formattedEnd = formatTime(endTime);

      luogu.push({
        id: contest.id,
        platform: 'Luogu',
        name: contest.title || 'Untitled Contest',
        startTime: `${formattedStart} - ${formattedEnd}`,
        url: contest.url,
      });
    }
  }

  return luogu;
}
