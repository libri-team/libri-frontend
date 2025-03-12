import type { Metadata } from 'next';
import { Nanum_Gothic } from 'next/font/google';
import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from '@/contexts/AuthContext';

const nanum_gothic = Nanum_Gothic({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
});

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
      <body className="bg-green-950">
        <main>
          <AuthProvider>{children}</AuthProvider>
        </main>
      </body>
    </html>
  );
}
