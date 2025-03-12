'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TokenManager from '@/components/TokenManager';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react'; // 이전 버튼 아이콘을 위해 추가

interface MemberInfo {
  id: number | null;
  uniqueId: string | null;
  nickname: string | null;
  [key: string]: unknown;
}

export default function Home() {
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [, setLoading] = useState<boolean>(false);
  const [, setError] = useState<string | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<
    'token' | 'uniqueId' | 'nickname' | 'complete'
  >('token');
  // 고유 ID 생성 관련 상태
  const [uniqueId, setUniqueId] = useState<string>('');
  const [uniqueIdLoading, setUniqueIdLoading] = useState<boolean>(false);
  const [uniqueIdError, setUniqueIdError] = useState<string | null>(null);

  // 닉네임 생성 관련 상태
  const [nickname, setNickname] = useState<string>('');
  const [nicknameLoading, setNicknameLoading] = useState<boolean>(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 콘솔 로그 추가
  useEffect(() => {
    console.log('Home 컴포넌트가 마운트되었습니다.');
    console.log('초기 온보딩 단계:', onboardingStep);

    return () => {
      console.log('Home 컴포넌트가 언마운트됩니다.');
    };
  }, []);

  // 온보딩 단계 변경 시 로그 추가
  useEffect(() => {
    console.log('온보딩 단계가 변경되었습니다:', onboardingStep);
  }, [onboardingStep]);

  // 이전 단계로 이동하는 함수
  const handleGoBack = () => {
    console.log('이전 단계로 이동을 시도합니다. 현재 단계:', onboardingStep);

    if (onboardingStep === 'nickname') {
      console.log('닉네임 단계에서 고유 ID 단계로 이동합니다.');
      setOnboardingStep('uniqueId');
    } else if (onboardingStep === 'uniqueId') {
      console.log('고유 ID 단계에서 토큰 단계로 이동합니다.');
      setOnboardingStep('token');
    } else if (onboardingStep === 'complete') {
      // 완료 단계에서는 이전 단계로 돌아가지 않고 로그아웃으로 처리
      console.log('완료 단계에서는 로그아웃을 통해 처음으로 돌아갑니다.');
      handleLogout();
    }
  };

  // 회원 정보 가져오기
  const fetchMemberInfo = useCallback(
    async (authToken = token) => {
      if (!authToken) {
        console.log('인증 토큰이 없어 회원 정보를 가져올 수 없습니다.');
        setError('인증 토큰이 없습니다.');
        return;
      }

      console.log('회원 정보 가져오기 시작...');
      setLoading(true);
      setError(null);

      try {
        console.log('API 요청 시작:', authToken);

        const response = await fetch('https://dev-api.libri.kr/member/my-info', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        });

        console.log('API 응답 상태:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API 오류 응답:', errorText);
          throw new Error(`API 요청 실패: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('API 응답 데이터:', data);

        // 여기에 데이터 처리 로직 추가
        setMemberInfo(data);
        localStorage.setItem('memberInfo', JSON.stringify(data));
        console.log('회원 정보가 상태와 로컬 스토리지에 저장되었습니다.');

        // 온보딩 단계 결정
        console.log('온보딩 단계 결정 중...');
        if (!data.uniqueId) {
          console.log('고유 ID가 없어 uniqueId 단계로 설정합니다.');
          setOnboardingStep('uniqueId');
        } else if (!data.nickname) {
          console.log('닉네임이 없어 nickname 단계로 설정합니다.');
          setOnboardingStep('nickname');
        } else {
          console.log('모든 정보가 있어 complete 단계로 설정합니다.');
          setOnboardingStep('complete');
        }
      } catch (err) {
        console.error('API 요청 중 오류 발생:', err);
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          console.error('네트워크 오류 - API 서버에 접근할 수 없습니다.');
        }

        setError(
          `데이터를 불러오는 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
        );
      } finally {
        console.log('회원 정보 가져오기 완료.');
        setLoading(false);
      }
    },
    [token],
  );

  // 컴포넌트 마운트 시 로컬 스토리지에서 토큰 확인
  useEffect(() => {
    console.log('로컬 스토리지에서 토큰 확인 중...');
    const localToken = localStorage.getItem('accessToken');
    if (localToken) {
      console.log('로컬 스토리지에서 토큰을 찾았습니다.');
      setTokenState(localToken);
      fetchMemberInfo(localToken);
    } else {
      console.log('로컬 스토리지에 토큰이 없습니다.');
    }
  }, [fetchMemberInfo]);

  // URL에서 토큰 확인
  useEffect(() => {
    console.log('URL에서 토큰 확인 중...');
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('token');

    if (accessToken) {
      console.log('URL에서 토큰을 찾았습니다.');
      localStorage.setItem('accessToken', accessToken);
      setTokenState(accessToken);

      // URL에서 토큰 파라미터 제거
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      console.log('URL에서 토큰 파라미터를 제거했습니다.');

      fetchMemberInfo(accessToken);
    } else {
      console.log('URL에 토큰이 없습니다.');
    }
  }, [fetchMemberInfo]);

  // 고유 ID 생성
  const createUniqueId = async () => {
    console.log('고유 ID 생성 시도:', uniqueId);

    if (!token) {
      console.warn('토큰이 없어 고유 ID를 생성할 수 없습니다.');
      setUniqueIdError('로그인이 필요합니다.');
      return;
    }

    if (!uniqueId.trim()) {
      console.warn('고유 ID가 입력되지 않았습니다.');
      setUniqueIdError('고유 ID를 입력해주세요.');
      return;
    }

    console.log('고유 ID 생성 API 호출 시작...');
    setUniqueIdLoading(true);
    setUniqueIdError(null);

    try {
      const response = await fetch('https://dev-api.libri.kr/member/create/unique-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uniqueId: uniqueId.trim() }),
      });

      console.log('고유 ID 생성 API 응답 상태:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('고유 ID 생성 API 오류 응답:', errorData);
        throw new Error(errorData.error || `서버 오류: ${response.status}`);
      }

      console.log('고유 ID가 성공적으로 생성되었습니다:', uniqueId);
      // 성공 후 다음 단계로 이동
      setOnboardingStep('nickname');
    } catch (err) {
      console.error('고유 ID 생성 중 오류:', err);
      setUniqueIdError(
        `고유 ID 생성 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setUniqueIdLoading(false);
      console.log('고유 ID 생성 처리가 완료되었습니다.');
    }
  };

  // 닉네임 생성
  const createNickname = async () => {
    console.log('닉네임 생성 시도:', nickname);

    if (!token) {
      console.warn('토큰이 없어 닉네임을 생성할 수 없습니다.');
      setNicknameError('로그인이 필요합니다.');
      return;
    }

    if (!nickname.trim()) {
      console.warn('닉네임이 입력되지 않았습니다.');
      setNicknameError('닉네임을 입력해주세요.');
      return;
    }

    console.log('닉네임 생성 API 호출 시작...');
    setNicknameLoading(true);
    setNicknameError(null);

    try {
      const response = await fetch('https://dev-api.libri.kr/member/create/nickname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });

      console.log('닉네임 생성 API 응답 상태:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('닉네임 생성 API 오류 응답:', errorData);
        throw new Error(errorData.error || `서버 오류: ${response.status}`);
      }

      console.log('닉네임이 성공적으로 생성되었습니다:', nickname);
      // 성공 후 다음 단계로 이동
      setOnboardingStep('complete');
    } catch (err) {
      console.error('닉네임 생성 중 오류:', err);
      setNicknameError(
        `닉네임 생성 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setNicknameLoading(false);
      console.log('닉네임 생성 처리가 완료되었습니다.');
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    console.log('로그아웃 시작...');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('memberInfo');
    setTokenState(null);
    setMemberInfo(null);
    setOnboardingStep('token');
    console.log('로그아웃 완료');
  };

  // 신규 책 추가 페이지로 이동
  const handleNavigateToNewBook = () => {
    console.log('신규 책 추가 페이지로 이동합니다.');
    window.location.href = '/newbook';
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* 배경 이미지 */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/background.svg"
          alt="Forest Background"
          fill
          priority
          quality={100}
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/10 z-10"></div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-4">
        {/* 로고 */}
        <div className="mb-10 text-center">
          <Link href="/" className="block">
            <Image src="/logo.svg" width={150} height={100} alt="logo" />
          </Link>
        </div>

        {/* 단계별 콘텐츠 컨테이너 */}
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 relative">
          {/* 이전 버튼 - uniqueId와 nickname 단계에서만 표시 */}
          {(onboardingStep === 'uniqueId' || onboardingStep === 'nickname') && (
            <button
              onClick={handleGoBack}
              className="absolute left-4 top-4 text-gray-500 hover:text-green-700 transition-colors p-2 rounded-full hover:bg-gray-100"
              aria-label="이전 단계로 이동"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <AnimatePresence mode="wait">
            {onboardingStep === 'token' && (
              <motion.div
                key="token"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* 토큰 관리 컴포넌트 커스텀 스타일링 */}
                <div className="token-manager-wrapper">
                  <TokenManager
                    onTokenSet={(newToken) => {
                      console.log('새 토큰이 설정됨:', newToken);
                      setTokenState(newToken);
                      if (newToken) {
                        fetchMemberInfo(newToken);
                      }
                    }}
                  />
                </div>
              </motion.div>
            )}

            {onboardingStep === 'uniqueId' && (
              <motion.div
                key="uniqueId"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-6 h-80"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">아이디 생성</h2>
                <p className="text-gray-500 text-sm mb-6">사용하실 아이디를 입력해 주세요.</p>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">아이디</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={uniqueId}
                      onChange={(e) => {
                        console.log('고유 ID 입력값 변경:', e.target.value);
                        setUniqueId(e.target.value);
                      }}
                      placeholder="아이디를 입력해 주세요"
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </div>

                {uniqueIdError && <div className="mb-4 text-red-500 text-sm">{uniqueIdError}</div>}

                <div className="flex space-x-3">
                  <button
                    onClick={handleGoBack}
                    className="flex-1 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    이전
                  </button>
                  <button
                    onClick={createUniqueId}
                    disabled={uniqueIdLoading}
                    className="flex-1 py-2 bg-green-800 text-white rounded-md hover:bg-green-900 transition-colors"
                  >
                    {uniqueIdLoading ? '처리 중...' : '다음'}
                  </button>
                </div>
              </motion.div>
            )}

            {onboardingStep === 'nickname' && (
              <motion.div
                key="nickname"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-6"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">닉네임 생성</h2>
                <p className="text-gray-500 text-sm mb-6">사용하실 닉네임을 입력해 주세요.</p>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">닉네임</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      console.log('닉네임 입력값 변경:', e.target.value);
                      setNickname(e.target.value);
                    }}
                    placeholder="20자 이내로 입력해 주세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {nicknameError && <div className="mb-4 text-red-500 text-sm">{nicknameError}</div>}

                <div className="flex space-x-3">
                  <button
                    onClick={handleGoBack}
                    className="flex-1 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    이전
                  </button>
                  <button
                    onClick={createNickname}
                    disabled={nicknameLoading}
                    className="flex-1 py-2 bg-green-800 text-white rounded-md hover:bg-green-900 transition-colors"
                  >
                    {nicknameLoading ? '처리 중...' : '완료'}
                  </button>
                </div>
              </motion.div>
            )}

            {onboardingStep === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">인증 완료</h2>

                <div className="text-center mb-6">
                  {/* 이메일 정보 추가 */}

                  {memberInfo?.nickname && (
                    <p className="text-gray-700">
                      안녕하세요, <span className="font-semibold">{memberInfo.nickname}</span>님!
                    </p>
                  )}

                  {/* 사용자 정보 추가 */}
                  <div className="mt-4 bg-gray-100 p-4 rounded-md text-left">
                    <h3 className="text-base font-semibold text-gray-800 mb-8">
                      {' '}
                      {localStorage.getItem('loginEmail') || '이메일 정보 없음'}
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium text-gray-600">고유 ID:</span>{' '}
                        {memberInfo?.uniqueId || '미설정'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium text-gray-600">닉네임:</span>{' '}
                        {memberInfo?.nickname || '미설정'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleNavigateToNewBook}
                    className="w-full py-2 bg-green-800 text-white rounded-md hover:bg-green-900 transition-colors"
                  >
                    책 추가하러가기
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 푸터 */}
        <div className="mt-8 text-center">
          <p className="text-xs text-white">© 2024 Libri All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
