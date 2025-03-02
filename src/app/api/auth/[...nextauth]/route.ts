// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// NextAuth의 기본 타입을 확장
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    idToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    idToken?: string;
  }
}

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
        // session 타입에 accessToken, idToken 속성 추가
        session.accessToken = token.accessToken;
        session.idToken = token.idToken;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 외부 URL이면 기본 URL로 리다이렉트
      if (url.startsWith("http") && !url.startsWith(baseUrl)) 
        return baseUrl;
      // 상대 경로면 기본 URL + 경로로 리다이렉트
      if (url.startsWith("/")) 
        return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  
  pages: {
    signIn: '/auth/login',
    signOut: '/',
    error: '/error',
    verifyRequest: '/',
    newUser: '/mylibrary'
  },
  
  session: {
    strategy: 'jwt', // JWT 세션 사용
    maxAge: 30 * 24 * 60 * 60, // 30일 (초 단위)
  },
  
  secret: process.env.NEXTAUTH_SECRET, // 환경변수에서 시크릿 키 가져오기
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
