'use client';

import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

const NaverLogin = () => {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <div className="flex flex-col items-center gap-4">
        <img className="w-8 h-8 rounded-full" src={session.user.image || ''} />

        <p className="text-sky-600"> {session.user.email}님 환영합니다</p>
        <button color="red" onClick={() => signOut()}>
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-5 p-2 bg-slate-200 ">
      <button
        onClick={() => signIn('naver')}
        className="bg-[#03C75A] hover:bg-[#02b351] text-white px-6 py-2 rounded-md flex items-center gap-2"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M11.9934 10.3127L8.01199 4.68945H4.68945V15.3104H8.00659V9.68727L11.9879 15.3104H15.3105V4.68945H11.9934V10.3127Z"
            fill="currentColor"
          />
        </svg>
        네이버로 로그인
      </button>
    </div>
  );
};

export default NaverLogin;
