'use client';
import React from 'react';
import Naver from '@/components/NaverLogin';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  console.log('Session Data:', session);
  console.log('Authentication Status:', status);
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex flex-col rounded-xl p-5 bg-green-400 text-white transition-all duration-300 ease-in-out hover:bg-green-600 hover:scale-105 gap-4 items-center sm:items-start">
          <Naver />
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
