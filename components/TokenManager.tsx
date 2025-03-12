'use client';
import React, { useState, useEffect } from 'react';

// Define types for token-related functions and components
interface TokenManagerProps {
  onTokenSet?: (token: string | null) => void;
}

// Token storage and logging function
const storeTokenAndLog = (token: string): string => {
  // Remove Bearer prefix if present
  const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;

  console.log('토큰 저장 중...');
  console.log('원본 토큰:', token);
  console.log('정제된 토큰:', cleanToken);

  // Store in local storage
  localStorage.setItem('accessToken', cleanToken);
  console.log('토큰이 로컬 스토리지에 저장되었습니다.');

  // Decode token and display information (for debugging)
  try {
    const parts = cleanToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('토큰 페이로드:', payload);

      //이메일 정보 로컬스토리지에 저장
      if (payload.sub) {
        localStorage.setItem('loginEmail', payload.sub);
        console.log('이메일 정보 저장:', payload.sub);
      }
      // Calculate expiration time
      if (payload.exp) {
        const expiryDate = new Date(payload.exp * 1000);
        console.log('토큰 만료 시간:', expiryDate.toLocaleString());

        // Calculate remaining time
        const now = new Date();
        const remainingTime = expiryDate.getTime() - now.getTime();
        const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
        console.log(`토큰 만료까지 남은 시간: ${remainingMinutes}분`);
      }

      // User information
      if (payload.sub) {
        console.log('토큰 사용자:', payload.sub);
      }
    }
  } catch (error) {
    console.error('토큰 디코딩 오류:', error);
  }

  return cleanToken;
};

const TokenManager: React.FC<TokenManagerProps> = ({ onTokenSet }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [, setStoredToken] = useState<string | null>(null);

  // 이메일 관련 상태
  const [emailId, setEmailId] = useState<string>('');
  const [emailDomain, setEmailDomain] = useState<string>('@gmail.com');

  // Check for token in localStorage on component mount
  useEffect(() => {
    const checkStoredToken = (): boolean => {
      const localToken = localStorage.getItem('accessToken');
      if (localToken) {
        console.log('로컬 스토리지에 저장된 토큰:', localToken);
        setStoredToken(localToken);
        return true;
      }
      console.log('로컬 스토리지에 토큰이 없습니다.');
      return false;
    };

    checkStoredToken();
  }, []);

  // Generate test token
  const handleGenerateTestToken = async (): Promise<void> => {
    try {
      // 이메일 ID 체크
      if (!emailId.trim()) {
        setError('이메일을 입력해주세요.');
        return;
      }

      // 전체 이메일 조합
      const fullEmail = emailId.trim() + emailDomain;

      setLoading(true);
      setError(null);

      console.log(`/auth/test/token API 호출 중 (test_email=${fullEmail})...`);

      // Direct API call (may have CORS issues)
      const response = await fetch(
        `https://dev-api.libri.kr/auth/test/token?test_email=${encodeURIComponent(fullEmail)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      console.log('토큰 생성 응답:', data);

      if (data.token) {
        // Store and log token
        const cleanToken = storeTokenAndLog(data.token);

        setSuccess(true);
        setStoredToken(cleanToken);
        setEmailId(''); // Reset input field

        // Notify parent component
        if (onTokenSet) {
          onTokenSet(cleanToken);
        }

        // Reset success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        throw new Error('응답에 토큰이 없습니다.');
      }
    } catch (err) {
      console.error('테스트 토큰 생성 오류:', err);
      setError(`테스트 토큰 생성 중 오류: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-80 flex flex-col justify-center items-center gap-6">
      <div>
        {' '}
        <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">아이디 생성</h2>
        <p className="text-gray-500 text-sm mb-6 text-center">
          사용하실 아이디와 이메일을 입력해 주세요.
        </p>
      </div>

      {/* 이메일 입력 */}
      <div className="w-full mb-6">
        <div className="flex">
          <input
            type="text"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            placeholder="이메일 아이디"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <select
            value={emailDomain}
            onChange={(e) => setEmailDomain(e.target.value)}
            className="px-3 py-2 border border-gray-300 border-l-0 rounded-r-md bg-white"
          >
            <option value="@gmail.com">@gmail.com</option>
            <option value="@naver.com">@naver.com</option>
          </select>
        </div>
      </div>

      {/* 생성 버튼 */}
      <button
        onClick={handleGenerateTestToken}
        disabled={loading || !emailId.trim()}
        className={`
          w-full py-2 px-4 rounded font-medium 
          ${
            loading || !emailId.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#215B32] text-white hover:opacity-80'
          }`}
      >
        {loading ? '처리 중...' : '생성'}
      </button>

      {/* Status messages */}
      {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {success && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
          토큰이 성공적으로 설정되었습니다.
        </div>
      )}
    </div>
  );
};

export default TokenManager;
