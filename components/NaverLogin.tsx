'use client';

import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

const NaverLogin = () => {
  const { data: session } = useSession();

  const handleSignIn = () => {
    signIn('naver', {
      callbackUrl: '/',
      prompt: 'login', // 강제로 다시 로그인 페이지 표시
    });
  };

  const handleCompleteSignOut = async () => {
    // 모든 NextAuth 쿠키 삭제
    document.cookie =
      'next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure';
    document.cookie =
      'next-auth.csrf-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure';
    document.cookie =
      'next-auth.callback-url=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure';

    // 로컬 스토리지 데이터도 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('memberInfo');

    // NextAuth 로그아웃 처리 및 홈으로 리다이렉트
    await signOut({ callbackUrl: '/', redirect: true });
  };

  if (session?.user) {
    return (
      <div className="flex flex-col items-center gap-4">
        <img className="w-8 h-8 rounded-full" src={session.user.image || ''} />

        <p className="text-sky-600"> {session.user.email}님 환영합니다</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center shadow-sm transition-colors"
          color="red"
          onClick={handleCompleteSignOut}
        >
          로그아웃
        </motion.button>
      </div>
    );
  }

  return (
    <motion.button className="flex gap-5 p-2 bg-slate-200 ">
      <button
        onClick={handleSignIn}
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
    </motion.button>
  );
};

export default NaverLogin;
