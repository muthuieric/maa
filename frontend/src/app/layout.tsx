import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Narrative Monitor | Narok & Kajiado Counties',
  description: 'Community narrative monitoring tool for detecting early warning signals of FGM and child marriage in Swahili and Maa.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-savanna-200">
        {children}
      </body>
    </html>
  );
}

