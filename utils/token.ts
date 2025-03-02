// utils/token.ts
/**
 * 로컬 스토리지에서 액세스 토큰을 가져오는 함수
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

/**
 * 로컬 스토리지에 액세스 토큰을 저장하는 함수
 */
export const setAccessToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', token);

  // 개발용 콘솔 로그
  console.log('액세스 토큰이 저장되었습니다.');

  try {
    const payload = parseJwt(token);
    if (payload && payload.exp) {
      const expiryDate = new Date(payload.exp * 1000);
      console.log(`토큰 만료 시간: ${expiryDate.toLocaleString()}`);
    }
  } catch (error) {
    console.error('토큰 정보 분석 중 오류:', error);
  }
};

/**
 * 로컬 스토리지에서 액세스 토큰을 제거하는 함수
 */
export const removeAccessToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  console.log('액세스 토큰이 제거되었습니다.');
};

/**
 * JWT 토큰을 파싱하여 페이로드를 반환하는 함수
 */
export const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT 파싱 오류:', error);
    return null;
  }
};

/**
 * 토큰이 만료되었는지 확인하는 함수
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  try {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return true;

    // 현재 시간과 만료 시간 비교 (초 단위)
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('토큰 만료 확인 중 오류:', error);
    return true;
  }
};

/**
 * API 요청 시 인증 헤더를 생성하는 함수
 */
export const getAuthHeader = (): Record<string, string> => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
