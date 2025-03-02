'use client';
import React, { useState, useEffect } from 'react';
import GoogleLogin from '@/components/GoogleLogin';
// next-auth에서 signIn 함수 임포트
import { useSession } from 'next-auth/react';

interface MemberInfo {
  id: number;
  uniqueId: string | null;
  nickname: string | null;
  [key: string]: any;
}

export default function Home() {
  const { data: session } = useSession();
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loginStatus, setLoginStatus] = useState<string>('');

  // 세션 디버깅
  useEffect(() => {
    if (session) {
      console.log('세션 정보:', session);
      // @ts-ignore - 타입 문제를 우회하는 임시 방법
      const accessToken = session.accessToken;
      if (accessToken) {
        console.log('세션 액세스 토큰:', accessToken);
        setToken(String(accessToken));
      }
    }
  }, [session]);

  // 고유 ID 생성 관련 상태
  const [uniqueId, setUniqueId] = useState<string>('');
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [createSuccess, setCreateSuccess] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // 세션이 변경될 때마다 토큰 가져오기 및 자동 로그인 시도
  useEffect(() => {
    if (session) {
      console.log('로그인 성공!');
      fetchTokenAndLogin();
    }
  }, [session]);

  // 토큰을 가져오고 로그인 진행
  const fetchTokenAndLogin = async () => {
    setLoginStatus('토큰 가져오는 중...');
    try {
      // 1. Session에서 토큰을 가져오거나 없는 경우 백엔드 API에서 가져오기
      let authToken = token;

      if (!authToken && session?.accessToken) {
        // NextAuth 세션에서 토큰 사용
        authToken = String(session.accessToken);
        console.log('NextAuth 세션 토큰 사용:', authToken);
        setToken(authToken);
      } else if (!authToken) {
        // 백엔드 API에서 토큰 가져오기
        const tokenResponse = await fetch('/api/get-token', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!tokenResponse.ok) {
          throw new Error('토큰 정보를 가져오는데 실패했습니다.');
        }

        const tokenData = await tokenResponse.json();
        authToken = tokenData.token;
        console.log('백엔드 API 토큰 정보:', authToken);
        setToken(authToken);
      }

      if (!authToken) {
        throw new Error('토큰을 가져올 수 없습니다.');
      }

      // 2. 가져온 토큰으로 백엔드 로그인 API 호출
      await loginWithToken(authToken);
    } catch (err) {
      console.error('토큰 가져오기 또는 로그인 오류:', err);
      setLoginStatus(`로그인 실패: ${err instanceof Error ? err.message : String(err)}`);
      setError(
        `로그인 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  // 토큰을 사용하여 백엔드 로그인 처리
  const loginWithToken = async (authToken: string) => {
    setLoginStatus('토큰으로 로그인 중...');
    try {
      // 백엔드에서 제공한 /auth/test/token 엔드포인트 또는 다른 로그인 엔드포인트 호출
      const loginResponse = await fetch('/auth/test/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`, // 토큰을 Authorization 헤더에 포함
        },
      });

      if (!loginResponse.ok) {
        throw new Error(`로그인 실패: ${loginResponse.status}`);
      }

      const loginData = await loginResponse.json();
      console.log('로그인 성공 응답:', loginData);
      setLoginStatus('로그인 성공!');

      // 로그인 성공 후 회원 정보 바로 가져오기
      await fetchMemberInfo();
    } catch (err) {
      console.error('토큰 로그인 오류:', err);
      setLoginStatus(`로그인 실패: ${err instanceof Error ? err.message : String(err)}`);
      setError(
        `토큰 로그인 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  // 수동으로 로그인 시도하는 함수 (버튼에 연결)
  const handleManualLogin = async () => {
    if (token) {
      await loginWithToken(token);
    } else if (session) {
      await fetchTokenAndLogin();
    } else {
      setError('로그인 상태가 아닙니다. 먼저 구글 로그인을 해주세요.');
    }
  };

  const fetchMemberInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/member-info', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '', // 토큰이 있다면 Authorization 헤더에 포함
        },
      });

      if (!response.ok) {
        throw new Error(`에러: ${response.status}`);
      }

      const data = await response.json();
      console.log('API 응답 데이터:', data);
      setMemberInfo(data);
    } catch (err) {
      console.error('API 호출 중 오류:', err);
      setError(
        `데이터를 불러오는 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const createUniqueId = async () => {
    if (!uniqueId.trim()) {
      setCreateError('고유 ID를 입력해주세요.');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(false);

    try {
      const response = await fetch('/api/create-unique-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '', // 토큰이 있다면 Authorization 헤더에 포함
        },
        body: JSON.stringify({ uniqueId: uniqueId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `서버 오류: ${response.status}`);
      }

      const data = await response.json();
      console.log('고유 ID 생성 응답:', data);
      setCreateSuccess(true);

      // 성공 후 회원 정보 다시 불러오기
      await fetchMemberInfo();
    } catch (err) {
      console.error('고유 ID 생성 중 오류:', err);
      setCreateError(
        `고유 ID 생성 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-4xl">
        <div className="flex flex-col rounded-xl p-5 bg-gray-100 transition-all duration-300 ease-in-out hover:bg-gray-200 hover:scale-105 gap-4 items-center sm:items-start w-full">
          <h2 className="text-xl font-bold mb-2 text-gray-800">소셜 로그인</h2>
          <GoogleLogin />
        </div>

        {/* 로그인 상태 표시 */}
        {loginStatus && (
          <div
            className={`w-full p-4 rounded-lg ${loginStatus.includes('실패') ? 'bg-red-100 text-red-700' : loginStatus.includes('성공') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}
          >
            <p className="font-medium">{loginStatus}</p>
          </div>
        )}

        {/* 수동 로그인 버튼 */}
        <button
          onClick={handleManualLogin}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out"
        >
          토큰으로 로그인
        </button>

        {/* 고유 ID 생성 섹션 */}
        <div className="w-full p-6 bg-white shadow-md rounded-lg">
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
              disabled={createLoading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out"
            >
              {createLoading ? '처리 중...' : '고유 ID 생성'}
            </button>
          </div>

          {createError && (
            <div
              className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">오류!</strong>
              <span className="block sm:inline"> {createError}</span>
            </div>
          )}

          {createSuccess && (
            <div
              className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">성공!</strong>
              <span className="block sm:inline"> 고유 ID가 성공적으로 생성되었습니다.</span>
            </div>
          )}
        </div>

        <button
          onClick={fetchMemberInfo}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out"
        >
          {loading ? '로딩 중...' : '회원 정보 조회'}
        </button>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-full"
            role="alert"
          >
            <strong className="font-bold">오류!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {memberInfo && (
          <div className="w-full mt-4">
            <h2 className="text-xl font-bold mb-4">회원 정보</h2>
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
                  {Object.entries(memberInfo).map(([key, value]) => (
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
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
