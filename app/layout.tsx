import type {Metadata} from 'next';
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'PitchLog — ジュニアサッカー振り返り＆成長トラッカー',
  description: 'ジュニアサッカー選手のための試合・練習振り返り、AI専属コーチ分析、YouTubeタイムスタンプ連携、スパイク使用時間トラッカー',
  openGraph: {
    title: 'PitchLog — ジュニアサッカー振り返り＆成長トラッカー',
    description: 'ジュニアサッカー選手のための試合・練習振り返り、AI専属コーチ分析、YouTubeタイムスタンプ連携、スパイク使用時間トラッカー',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PitchLog — ジュニアサッカー振り返り＆成長トラッカー',
    description: 'ジュニアサッカー選手のための試合・練習振り返り、AI専属コーチ分析、YouTubeタイムスタンプ連携、スパイク使用時間トラッカー',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ja" className={`${outfit.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} dark`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200 min-h-screen">
        {children}
      </body>
    </html>
  );
}
