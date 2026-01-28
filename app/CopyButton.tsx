'use client';

import { ContestData } from '@/lib/types';
import { useState } from 'react';

interface CopyButtonProps {
  data: ContestData;
}

function formatToPlainText(data: ContestData): string {
  let text = '本周赛事预告~\n\n';

  // Codeforces section
  text += 'Codeforces:\n';
  if (data.codeforces.length === 0) {
    text += '暂无比赛\n';
  } else {
    data.codeforces.forEach((contest) => {
      text += `${contest.name}  ${contest.startTime}`;
      if (contest.endTime) {
        text += ` - ${contest.endTime}`;
      }
      text += '\n';
    });
  }

  text += '\n';

  // AtCoder section
  text += 'Atcoder:\n';
  if (data.atcoder.length === 0) {
    text += '暂无比赛\n';
  } else {
    data.atcoder.forEach((contest) => {
      text += `${contest.name}  ${contest.startTime}\n`;
    });
  }

  text += '\n';

  // Luogu section
  text += 'Luogu:\n';
  if (data.luogu.length === 0) {
    text += '暂无比赛\n';
  } else {
    data.luogu.forEach((contest) => {
      text += `${contest.name}\t\t${contest.startTime}\n`;
    });
  }

  return text;
}

export default function CopyButton({ data }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = formatToPlainText(data);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
    >
      {copied ? '已复制!' : '复制'}
    </button>
  );
}
