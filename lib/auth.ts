// lib/auth.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // 계정 정보가 있을 경우 액세스 토큰 추가
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      // 세션에 액세스 토큰 추가
      session.accessToken = token.accessToken as string;
      session.provider = token.provider as string;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 허용된 리디렉션 URI 목록
      const allowedRedirectURIs = [
        'https://example.com:8080',
        'http://localhost:3000',
        'https://dev.libri.kr',
        'http://localhost:8080/login/oauth2/code/google',
        'http://localhost:8081/login/oauth2/code/google',
        'https://dev-api.libri.kr/login/oauth2/code/google',
        'http://localhost:3000/login/oauth2/code/google',
        'http://localhost:3000/api/auth/callback/google',
      ];

      // 요청된 URL이 허용된 리디렉션 URI 중 하나인지 확인
      if (allowedRedirectURIs.includes(url)) {
        return url;
      }

      // 기본적으로 baseUrl로 리디렉션
      return baseUrl;
    },
  },
  pages: {
    signIn: '/', // 커스텀 로그인 페이지 경로
  },
};

export default NextAuth(authOptions);
