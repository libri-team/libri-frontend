// utils/auth.ts

/**
 * 토큰을 저장하고 콘솔에 로깅하는 함수
 */
export const storeTokenAndLog = (token: string): string => {
  // Bearer 접두사가 있으면 제거
  const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;

  console.log('토큰 저장 중...');
  console.log('원본 토큰:', token);
  console.log('정제된 토큰:', cleanToken);

  // 로컬 스토리지에 저장
  localStorage.setItem('accessToken', cleanToken);
  console.log('토큰이 로컬 스토리지에 저장되었습니다.');

  // 토큰 디코딩 및 정보 표시 (디버깅용)
  try {
    const parts = cleanToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('토큰 페이로드:', payload);

      // 만료 시간 계산
      if (payload.exp) {
        const expiryDate = new Date(payload.exp * 1000);
        console.log('토큰 만료 시간:', expiryDate.toLocaleString());

        // 남은 시간 계산
        const now = new Date();
        const remainingTime = expiryDate.getTime() - now.getTime();
        const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
        console.log(`토큰 만료까지 남은 시간: ${remainingMinutes}분`);
      }

      // 사용자 정보
      if (payload.sub) {
        console.log('토큰 사용자:', payload.sub);
      }
    }
  } catch (error) {
    console.error('토큰 디코딩 오류:', error);
  }

  return cleanToken;
};

/**
 * API 요청 옵션 타입 정의
 */
interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * 토큰으로 인증된 API 요청을 보내는 함수
 */
export const fetchWithAuth = async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    console.error('인증 토큰이 없습니다.');
    throw new Error('인증 토큰이 없습니다. 먼저 로그인해주세요.');
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.message || `API 오류: ${response.status}`;
      } catch (e) {
        errorMessage = `API 오류: ${response.status}`;
      }

      throw new Error(errorMessage);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error('API 요청 오류:', error);
    throw error;
  }
};

/**
 * 토큰 유효성 검사 함수
 */
export const isTokenValid = (): boolean => {
  try {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    return !payload.exp || payload.exp > now;
  } catch (error) {
    console.error('토큰 유효성 검사 오류:', error);
    return false;
  }
};
