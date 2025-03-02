'use client';
import React, { useState, useEffect, useCallback } from 'react';
import TokenManager from '@/components/TokenManager';
import { motion, AnimatePresence } from 'framer-motion';

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

  // 온보딩 단계 상태
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

  // 회원 정보 가져오기
  const fetchMemberInfo = useCallback(
    async (authToken = token) => {
      if (!authToken) {
        setError('인증 토큰이 없습니다.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('https://dev-api.libri.kr/member/my-info', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`에러: ${response.status}`);
        }

        const data = await response.json();
        setMemberInfo(data);
        localStorage.setItem('memberInfo', JSON.stringify(data));

        // 온보딩 단계 결정
        if (!data.uniqueId) {
          setOnboardingStep('uniqueId');
        } else if (!data.nickname) {
          setOnboardingStep('nickname');
        } else {
          setOnboardingStep('complete');
        }
      } catch (err) {
        console.error('회원 정보 API 호출 중 오류:', err);
        setError(
          `데이터를 불러오는 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
        );
      } finally {
        setLoading(false);
      }
    },
    [token],
  ); // token을 의존성 배열에 추가

  // 컴포넌트 마운트 시 로컬 스토리지에서 토큰 확인
  useEffect(() => {
    const localToken = localStorage.getItem('accessToken');
    if (localToken) {
      setTokenState(localToken);
      fetchMemberInfo(localToken);
    }
  }, [fetchMemberInfo]); // fetchMemberInfo를 의존성 배열에 추가

  // URL에서 토큰 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('token');

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      setTokenState(accessToken);

      // URL에서 토큰 파라미터 제거
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      fetchMemberInfo(accessToken);
    }
  }, [fetchMemberInfo]);

  // 고유 ID 생성
  const createUniqueId = async () => {
    if (!token) {
      setUniqueIdError('로그인이 필요합니다.');
      return;
    }

    if (!uniqueId.trim()) {
      setUniqueIdError('고유 ID를 입력해주세요.');
      return;
    }

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `서버 오류: ${response.status}`);
      }

      // 성공 후 다음 단계로 이동
      setOnboardingStep('nickname');
    } catch (err) {
      console.error('고유 ID 생성 중 오류:', err);
      setUniqueIdError(
        `고유 ID 생성 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setUniqueIdLoading(false);
    }
  };

  // 닉네임 생성
  const createNickname = async () => {
    if (!token) {
      setNicknameError('로그인이 필요합니다.');
      return;
    }

    if (!nickname.trim()) {
      setNicknameError('닉네임을 입력해주세요.');
      return;
    }

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `서버 오류: ${response.status}`);
      }

      // 성공 후 다음 단계로 이동
      setOnboardingStep('complete');
    } catch (err) {
      console.error('닉네임 생성 중 오류:', err);
      setNicknameError(
        `닉네임 생성 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setNicknameLoading(false);
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {onboardingStep === 'token' && (
            <motion.div
              key="token"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="flex flex-col rounded-xl p-5 bg-gray-100 transition-all duration-300 ease-in-out hover:bg-gray-200 hover:scale-105 gap-4 items-center sm:items-start w-full"
            >
              <h2 className="text-xl font-bold mb-2 text-gray-800">LIBRI</h2>
            </motion.div>
          )}

          {onboardingStep === 'uniqueId' && (
            <motion.div
              key="uniqueId"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="w-full p-6 bg-white shadow-md rounded-lg"
            >
              <h2 className="text-xl font-bold mb-4">고유 ID 생성</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={uniqueId}
                  onChange={(e) => setUniqueId(e.target.value)}
                  placeholder="고유 ID 입력"
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
                />
                <button
                  onClick={createUniqueId}
                  disabled={uniqueIdLoading}
                  className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out ${
                    uniqueIdLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-700 text-white'
                  }`}
                >
                  {uniqueIdLoading ? '처리 중...' : '고유 ID 생성'}
                </button>
              </div>

              {uniqueIdError && (
                <div
                  className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <strong className="font-bold">오류!</strong>
                  <span className="block sm:inline"> {uniqueIdError}</span>
                </div>
              )}
            </motion.div>
          )}

          {onboardingStep === 'nickname' && (
            <motion.div
              key="nickname"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="w-full p-6 bg-white shadow-md rounded-lg"
            >
              <h2 className="text-xl font-bold mb-4">닉네임 생성</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임 입력"
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
                />
                <button
                  onClick={createNickname}
                  disabled={nicknameLoading}
                  className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out ${
                    nicknameLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-700 text-white'
                  }`}
                >
                  {nicknameLoading ? '처리 중...' : '닉네임 생성'}
                </button>
              </div>

              {nicknameError && (
                <div
                  className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <strong className="font-bold">오류!</strong>
                  <span className="block sm:inline"> {nicknameError}</span>
                </div>
              )}
            </motion.div>
          )}

          {onboardingStep === 'complete' && (
            <>
              <motion.div
                key="complete"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="w-full p-6 bg-green-50 rounded-xl shadow-sm"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-green-800">로그인 성공!</h2>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out"
                  >
                    로그아웃
                  </button>
                </div>

                <div className="text-green-800">
                  <p className="text-lg">인증되었습니다.</p>
                  {memberInfo?.nickname && (
                    <p className="font-medium mt-1">안녕하세요, {memberInfo.nickname}님!</p>
                  )}
                  <button
                    onClick={handleNavigateToNewBook}
                    className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out"
                  >
                    신규 책 추가 페이지로 이동
                  </button>
                </div>
              </motion.div>

              {/* 회원 정보 테이블 */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full mt-4">
                <h2 className="text-xl font-bold mb-4 bg-white rounded-lg p-4">회원 정보</h2>
                <div className="bg-white shadow-md rounded-lg overflow-hidden w-full">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          필드
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          값
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(memberInfo || {}).map(([key, value]) => (
                        <tr key={key}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {key}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {value === null ? (
                              <span className="text-gray-400 italic">null</span>
                            ) : typeof value === 'object' ? (
                              JSON.stringify(value)
                            ) : (
                              String(value)
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 토큰 관리 컴포넌트 */}
        <TokenManager
          onTokenSet={(newToken) => {
            console.log('새 토큰이 설정됨:', newToken);
            setTokenState(newToken);
            if (newToken) {
              fetchMemberInfo(newToken);
            }
          }}
        />
      </main>
    </div>
  );
}
