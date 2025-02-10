import type { Metadata } from 'next';
import { Nanum_Gothic } from 'next/font/google';
import './globals.css';
import AuthSession from '@/components/AuthSession';

const nanum_gothic = Nanum_Gothic({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
});

// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// });

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: 'Libri - Your Personal Library ',
  description: 'Your Personal Library ',
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" className={nanum_gothic.className}>
      <body>
        <AuthSession>{children}</AuthSession>
      </body>
    </html>
  );
}
