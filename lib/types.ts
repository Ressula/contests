export interface Contest {
  id: string;
  platform: 'Codeforces' | 'AtCoder' | 'Luogu';
  name: string;
  startTime: string;
  endTime?: string;
  type?: string; // For Luogu (IOI, etc.)
  url?: string;
}

export interface ContestData {
  codeforces: Contest[];
  atcoder: Contest[];
  luogu: Contest[];
  lastUpdated: number;
}
