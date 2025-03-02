'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';
import { showAlert } from '@/components/ui/alert';

// useSearchParams를 사용하는 컴포넌트를 분리
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!token) {
      setError('유효하지 않은 비밀번호 재설정 링크입니다.');
    }
  }, [token]);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return '비밀번호는 8자 이상이어야 합니다.';
    }
    
    if (!/[A-Z]/.test(password)) {
      return '비밀번호는 대문자를 하나 이상 포함해야 합니다.';
    }
    
    if (!/[a-z]/.test(password)) {
      return '비밀번호는 소문자를 하나 이상 포함해야 합니다.';
    }
    
    if (!/[0-9]/.test(password)) {
      return '비밀번호는 숫자를 하나 이상 포함해야 합니다.';
    }
    
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 비밀번호 유효성 검사
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // 비밀번호 재설정 API 호출 (예시)
      // const response = await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, password }),
      // });
      
      // if (!response.ok) {
      //   throw new Error('비밀번호 재설정에 실패했습니다.');
      // }
      
      // 임시로 성공 처리 (API 연동 필요)
      setIsSuccess(true);
      showAlert('비밀번호가 성공적으로 재설정되었습니다.', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '비밀번호 재설정에 실패했습니다.';
      setError(errorMessage);
      showAlert('비밀번호 재설정에 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <Link href="/" className="inline-block">
          <Image src="/logo.svg" alt="Libri" width={150} height={50} className="mx-auto" />
        </Link>
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          비밀번호 재설정
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {isSuccess ? '비밀번호가 성공적으로 변경되었습니다' : '새로운 비밀번호를 설정해주세요'}
        </p>
      </div>
      
      <div className="mt-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {isSuccess ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-8 rounded-lg text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">비밀번호 변경 완료</h3>
            <p className="text-sm text-gray-600 mb-4">
              비밀번호가 성공적으로 변경되었습니다.<br />
              새 비밀번호로 로그인할 수 있습니다.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/auth/login')}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              로그인 페이지로 이동
            </motion.button>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                새 비밀번호
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                비밀번호는 8자 이상, 대소문자와 숫자를 포함해야 합니다.
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || !token}
                className="flex w-full justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-opacity-30 border-t-white rounded-full"></div>
                ) : (
                  "비밀번호 재설정"
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
  );
}

// 로딩 중 표시를 위한 컴포넌트
function LoadingComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<LoadingComponent />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
} 