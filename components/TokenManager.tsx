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
  const [, setToken] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [, setStoredToken] = useState<string | null>(null);

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
      setLoading(true);
      setError(null);

      console.log(`/auth/test/token API 호출 중 (test_email=${email})...`);

      // Direct API call (may have CORS issues)
      const response = await fetch(
        `https://dev-api.libri.kr/auth/test/token?test_email=${encodeURIComponent(email)}`,
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
        setToken(''); // Reset input field

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
    <div className="w-full p-6 ">
      {/* Test ID generation */}
      <div className="mb-4">
        <div className="flex space-x-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="libri@naver.com"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleGenerateTestToken}
            disabled={loading || !email.includes('@')}
            className={`
    z-30 py-2 px-4 rounded font-medium 
    ${
      loading || !email.includes('@')
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-[#215B32] text-white hover:opacity-80' // 불투명도로 호버 효과 대체
    }`}
          >
            {loading ? '처리 중...' : '생성'}
          </button>
        </div>
      </div>

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
