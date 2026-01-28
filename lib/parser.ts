import * as cheerio from 'cheerio';
import { Contest } from './types';

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

  // Parse Luogu contests
  $('h2').each((_, h2) => {
    const text = $(h2).text();
    if (text.includes('洛谷') || text.includes('Luogu')) {
      const table = $(h2).next('table');

      table.find('tbody tr').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 3) {
          const name = $(cells[0]).find('a').text().trim();
          const startTime = $(cells[1]).text().trim();
          const endTime = $(cells[2]).text().trim();

          if (name && startTime && isWithinWeek(startTime)) {
            const formattedStart = formatDateTime(startTime);
            const formattedEnd = endTime ? formatDateTime(endTime) : undefined;
            const timeStr = formattedEnd ? `${formattedStart} - ${formattedEnd}` : formattedStart;

            luogu.push({
              id: `lg-${luogu.length}`,
              platform: 'Luogu',
              name,
              startTime: timeStr,
            });
          }
        }
      });
    }
  });

  return { codeforces, atcoder, luogu };
}
