'use client';

// 타입 정의
export interface TokenResponse {
  token: string;
}

export interface RefreshResponse {
  accessToken: string;
  message?: string;
}

export class AuthService {
  // 백엔드 서버에서 테스트 토큰 가져오기
  static async getTestToken(email: string): Promise<string> {
    try {
      const response = await fetch(`/auth/test/token?test_email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error(`토큰 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔑 백엔드 토큰 수신:', data);

      // Bearer 접두사가 있는지 확인하고 처리
      const token = data.token || '';
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      // 로컬 스토리지에 저장
      localStorage.setItem('auth_token', formattedToken);
      return formattedToken;
    } catch (error) {
      console.error('테스트 토큰 가져오기 오류:', error);
      throw error;
    }
  }

  // 토큰 갱신
  static async refreshAccessToken(): Promise<string | null> {
    try {
      const currentToken = localStorage.getItem('auth_token');

      const response = await fetch('/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: currentToken || '',
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log('🔄 토큰 갱신 성공:', data.accessToken);
        const formattedToken = `Bearer ${data.accessToken}`;
        localStorage.setItem('auth_token', formattedToken);
        return formattedToken;
      } else {
        console.error('토큰 갱신 실패:', data.message);
        return null;
      }
    } catch (error) {
      console.error('토큰 갱신 중 오류 발생:', error);
      return null;
    }
  }

  // 토큰으로 로그인 처리
  static async loginWithToken(token: string): Promise<boolean> {
    try {
      console.log('🔑 토큰으로 로그인 시도:', token);

      // 백엔드 서버의 토큰 검증 API 호출
      const response = await fetch('/auth/test/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error(`토큰 로그인 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ 토큰 로그인 성공:', data);
      return true;
    } catch (error) {
      console.error('토큰 로그인 실패:', error);
      return false;
    }
  }

  // 현재 저장된 토큰 가져오기
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  // 로그인 여부 확인
  static isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // 로그아웃
  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // 세션 토큰에서 백엔드 토큰으로 변환 (NextAuth 세션 -> 백엔드 토큰)
  static async convertSessionToBackendToken(sessionToken: string): Promise<string | null> {
    try {
      // 세션 토큰을 백엔드 토큰으로 변환하는 API 호출
      const response = await fetch('/api/convert-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionToken }),
      });

      if (!response.ok) {
        throw new Error(`토큰 변환 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔄 세션 토큰 -> 백엔드 토큰 변환 성공:', data);

      const backendToken = data.token;
      localStorage.setItem('auth_token', backendToken);
      return backendToken;
    } catch (error) {
      console.error('토큰 변환 중 오류 발생:', error);
      return null;
    }
  }
}

// 브라우저 콘솔 디버깅 헬퍼
export const debugTokenInfo = () => {
  if (typeof window === 'undefined') return;

  console.group(
    '%c📊 토큰 디버그 정보',
    'background: #222; color: #00ffff; font-size: 16px; font-weight: bold;',
  );
  console.log('💾 localStorage 토큰:', localStorage.getItem('auth_token'));

  // next-auth 관련 항목 검색
  const nextAuthItems: Record<string, any> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('next-auth')) {
      try {
        nextAuthItems[key] = JSON.parse(localStorage.getItem(key) || '');
      } catch {
        nextAuthItems[key] = localStorage.getItem(key);
      }
    }
  }
  console.log('🔐 next-auth 항목:', nextAuthItems);
  console.groupEnd();

  return {
    authToken: localStorage.getItem('auth_token'),
    nextAuthItems,
  };
};
