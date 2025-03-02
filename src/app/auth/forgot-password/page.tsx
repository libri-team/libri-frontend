'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';
import { showAlert } from '@/components/ui/alert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // 비밀번호 찾기 API 호출 (예시)
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });
      
      // if (!response.ok) {
      //   throw new Error('비밀번호 재설정 메일 발송에 실패했습니다.');
      // }
      
      // 임시로 성공 처리 (API 연동 필요)
      setIsEmailSent(true);
      showAlert('비밀번호 재설정 이메일이 전송되었습니다.', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '비밀번호 재설정 메일 발송에 실패했습니다.';
      setError(errorMessage);
      showAlert('비밀번호 재설정 메일 발송에 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image src="/logo.svg" alt="Libri" width={150} height={50} className="mx-auto" />
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            비밀번호 찾기
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            등록한 이메일로 비밀번호 재설정 링크를 보내드립니다
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {isEmailSent ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-8 rounded-lg text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">이메일이 전송되었습니다</h3>
              <p className="text-sm text-gray-600 mb-4">
                {email}로 비밀번호 재설정 링크를 전송했습니다.<br />
                이메일 확인 후 링크를 클릭하여 비밀번호를 재설정해주세요.
              </p>
              <p className="text-xs text-gray-500">
                이메일을 받지 못하셨나요? 스팸함을 확인하거나 다시 시도해주세요.
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 items-center"
                >
                  {isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-opacity-30 border-t-white rounded-full"></div>
                  ) : (
                    <>
                      비밀번호 재설정 링크 받기
                      <Mail className="ml-2 h-4 w-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            <Link href="/auth/login" className="font-medium text-emerald-600 hover:text-emerald-500 inline-flex items-center">
              <ArrowLeft className="mr-1 h-4 w-4" />
              로그인 페이지로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 