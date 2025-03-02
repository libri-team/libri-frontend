// lib/axios.ts
import axios from 'axios';

const API_URL = 'https://dev-api.libri.kr';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 설정
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    // 모든 요청에 토큰 추가
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('요청 헤더에 토큰 추가됨:', config.url);
    }

    return config;
  },
  (error) => {
    console.error('요청 인터셉터 오류:', error);
    return Promise.reject(error);
  },
);

// 응답 인터셉터 설정
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`API 응답 성공 (${response.config.url}):`, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized 오류 처리 (토큰 만료)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 토큰 갱신 요청
        console.log('토큰 갱신 시도 중...');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('리프레시 토큰이 없습니다.');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        if (response.data?.accessToken) {
          // 새 토큰 저장
          localStorage.setItem('accessToken', response.data.accessToken);
          console.log('토큰이 성공적으로 갱신되었습니다.');

          // 원래 요청 헤더 업데이트
          originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;

          // 원래 요청 재시도
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError);
        // 로그아웃 상태로 전환
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // 로그인 페이지로 리다이렉트
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }

    console.error(`API 오류 (${error.config?.url}):`, error.response?.status, error.message);
    return Promise.reject(error);
  },
);

export default axiosInstance;
