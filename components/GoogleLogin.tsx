// components/SocialLogin.tsx
'use client';

import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

const SocialLogin = () => {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    // 로컬 스토리지 정리
    localStorage.removeItem('memberInfo');
    localStorage.removeItem('loginEmail');
    // NextAuth 로그아웃
    await signOut({ callbackUrl: '/' });
  };

  if (session?.user) {
    return (
      <div className="flex flex-col items-center gap-4">
        {session.user.image && (
          <img className="w-8 h-8 rounded-full" src={session.user.image} alt="사용자 프로필" />
        )}
        <p className="text-sky-600">{session.user.email}님 환영합니다</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center shadow-sm transition-colors"
          onClick={handleSignOut}
        >
          로그아웃
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => signIn('naver', { callbackUrl: '/' })}
        className="bg-[#03C75A] hover:bg-[#02b351] text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M11.9934 10.3127L8.01199 4.68945H4.68945V15.3104H8.00659V9.68727L11.9879 15.3104H15.3105V4.68945H11.9934V10.3127Z"
            fill="currentColor"
          />
        </svg>
        네이버로 로그인
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4.872C14.136 4.872 15.744 5.688 16.848 6.72L20.304 3.264C18.168 1.248 15.432 0 12 0C7.392 0 3.432 2.712 1.38 6.624L5.268 9.648C6.264 6.888 8.904 4.872 12 4.872Z"
            fill="#EA4335"
          />
          <path
            d="M23.76 12.252C23.76 11.448 23.688 10.68 23.568 9.936H12V14.604H18.72C18.432 16.116 17.592 17.352 16.356 18.192L20.112 21.12C22.38 19.008 23.76 15.936 23.76 12.252Z"
            fill="#4285F4"
          />
          <path
            d="M5.28 14.352C5.028 13.62 4.872 12.828 4.872 12C4.872 11.172 5.016 10.38 5.268 9.648L1.38 6.624C0.516 8.28 0 10.08 0 12C0 13.92 0.516 15.72 1.38 17.376L5.28 14.352Z"
            fill="#FBBC05"
          />
          <path
            d="M12 24C15.432 24 18.288 22.908 20.112 21.12L16.356 18.192C15.264 18.948 13.824 19.452 12 19.452C8.904 19.452 6.264 17.436 5.28 14.676L1.392 17.7C3.444 21.6 7.392 24 12 24Z"
            fill="#34A853"
          />
        </svg>
        구글로 로그인
      </motion.button>
    </div>
  );
};

export default SocialLogin;
