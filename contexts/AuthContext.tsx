'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 컴포넌트 마운트 시 로컬 스토리지에서 토큰 가져오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        setTokenState(storedToken);
        setIsAuthenticated(true);
        console.log('로컬 스토리지에서 토큰을 복원했습니다:', storedToken);
      }
    }
  }, []);

  // 토큰 설정 및 저장
  const setToken = (newToken: string | null) => {
    console.log('토큰 설정:', newToken);
    setTokenState(newToken);

    if (newToken) {
      // 토큰 정보 분석
      try {
        const tokenParts = newToken.split('.');
        if (tokenParts.length === 3) {
          const tokenPayload = JSON.parse(atob(tokenParts[1]));
          console.log('토큰 페이로드:', tokenPayload);
          console.log('토큰 만료 시간:', new Date(tokenPayload.exp * 1000).toLocaleString());
        }

        // 로컬 스토리지에 저장
        localStorage.setItem('accessToken', newToken);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('토큰 분석 오류:', error);

        // 오류가 발생해도 토큰은 저장
        localStorage.setItem('accessToken', newToken);
        setIsAuthenticated(true);
      }
    } else {
      // 토큰 제거
      localStorage.removeItem('accessToken');
      setIsAuthenticated(false);
    }
  };

  // 로그아웃
  const logout = () => {
    console.log('로그아웃 실행');
    setTokenState(null);
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ token, setToken, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
