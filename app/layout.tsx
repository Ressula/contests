import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contest Aggregator",
  description: "Upcoming coding contests from Codeforces, AtCoder, and Luogu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
