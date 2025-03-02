'use client';

import React from 'react';
import { signOut, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const NaverLogin = () => {
  const { data: session } = useSession();
  const router = useRouter();

  if (session?.user) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center shadow-sm transition-colors"
        onClick={() => signOut()}
      >
        로그아웃
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push('/auth/login')}
      className="bg-[#03C75A] hover:bg-[#02b351] text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M11.9934 10.3127L8.01199 4.68945H4.68945V15.3104H8.00659V9.68727L11.9879 15.3104H15.3105V4.68945H11.9934V10.3127Z"
          fill="currentColor"
        />
      </svg>
      로그인하기
    </motion.button>
  );
};

export default NaverLogin;
