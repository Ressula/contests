import * as cheerio from 'cheerio';
import { Contest } from './types';

function formatDateTime(dateStr: string): string {
  // Convert "2026-01-29 22:35:00" to "1.29 22:35"
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
  if (match) {
    const [, , month, day, hour, minute] = match;
    return `${parseInt(month)}.${parseInt(day)} ${hour}:${minute}`;
  }
  return dateStr;
}

function addHoursToDateTime(dateStr: string, hours: number): string {
  // Parse the date string and add hours
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
    const newSecond = String(date.getSeconds()).padStart(2, '0');

    return `${date.getFullYear()}-${newMonth}-${newDay} ${newHour}:${newMinute}:${newSecond}`;
  }
  return dateStr;
}

function formatAtCoderDateTime(dateStr: string): string {
  // Convert "2026-01-31 20:00:00" to "1/31(Sat) 20:00"
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
  if (match) {
    const [, year, month, day, hour, minute] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[date.getDay()];
    return `${parseInt(month)}/${parseInt(day)}(${dayName}) ${hour}:${minute}`;
  }
  return dateStr;
}

function formatLuoguDateTime(startStr: string, endStr?: string): string {
  // Convert "2026-01-30 19:00:00" to "01-30 19:00"
  const formatSingle = (dateStr: string) => {
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
    if (match) {
      const [, , month, day, hour, minute] = match;
      return `${month}-${day} ${hour}:${minute}`;
    }
    return dateStr;
  };

  if (endStr) {
    return `${formatSingle(startStr)} ~ ${formatSingle(endStr)}`;
  }
  return formatSingle(startStr);
}

export function parseContestHTML(html: string): {
  codeforces: Contest[];
  atcoder: Contest[];
  luogu: Contest[];
} {
  const $ = cheerio.load(html, { decodeEntities: true });

  const codeforces: Contest[] = [];
  const atcoder: Contest[] = [];
  const luogu: Contest[] = [];

  // Parse Codeforces contests
  let inCodeforcesSection = false;
  $('h2').each((_, h2) => {
    const text = $(h2).text();
    if (text.includes('Codeforces')) {
      inCodeforcesSection = true;
      const table = $(h2).next('table');

      table.find('tbody tr').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 3) {
          const name = $(cells[0]).find('a').text().trim();
          const startTime = $(cells[2]).text().trim();
          const duration = parseFloat($(cells[3]).text().trim());

          if (name && startTime) {
            const formattedStart = formatDateTime(startTime);

            // Calculate end time
            let endTime = '';
            if (duration && !isNaN(duration)) {
              const endStr = addHoursToDateTime(startTime, duration);
              endTime = formatDateTime(endStr);
            }

            codeforces.push({
              id: `cf-${codeforces.length}`,
              platform: 'Codeforces',
              name,
              startTime: formattedStart,
              endTime: endTime || undefined,
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
          // Get the HTML content and extract text properly
          const nameHtml = $(cells[0]).find('a').html() || '';
          const name = $('<div>').html(nameHtml).text().trim();
          const startTime = $(cells[1]).text().trim();

          if (name && startTime) {
            atcoder.push({
              id: `ac-${atcoder.length}`,
              platform: 'AtCoder',
              name,
              startTime: formatAtCoderDateTime(startTime),
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

          if (name && startTime) {
            luogu.push({
              id: `lg-${luogu.length}`,
              platform: 'Luogu',
              name,
              startTime: formatLuoguDateTime(startTime, endTime),
            });
          }
        }
      });
    }
  });

  return { codeforces, atcoder, luogu };
}
