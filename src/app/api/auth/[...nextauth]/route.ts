// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // 최초 로그인 시 액세스 토큰 저장
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      // JWT 토큰에서 세션으로 액세스 토큰 전달
      if (token) {
        // @ts-ignore
        session.accessToken = token.accessToken;
        // @ts-ignore
        session.idToken = token.idToken;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 로그인 후 리다이렉션 처리
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: '/login', // 커스텀 로그인 페이지 경로
    error: '/login', // 에러 발생 시 리다이렉션할 페이지
  },
  session: {
    strategy: 'jwt', // JWT 세션 사용
    maxAge: 30 * 24 * 60 * 60, // 30일 (초 단위)
  },
  secret: process.env.NEXTAUTH_SECRET, // 환경변수에서 시크릿 키 가져오기
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
