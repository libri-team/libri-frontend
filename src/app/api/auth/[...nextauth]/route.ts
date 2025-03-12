// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import NaverProvider from 'next-auth/providers/naver';
import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from 'next-auth';

// Environment-specific redirect URI configuration
const redirectUri =
  process.env.NODE_ENV === 'production'
    ? 'https://dev-api.libri.kr/login/oauth2/code/google'
    : 'http://localhost:3000/login/oauth2/code/google';

export const authOptions: NextAuthOptions = {
  providers: [
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID as string,
      clientSecret: process.env.NAVER_CLIENT_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          redirect_uri: redirectUri,
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // 로그인 시 토큰에 접근 토큰 저장
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider; // 제공자 정보 저장
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // JWT 토큰의 접근 토큰을 세션에 전달
      session.accessToken = token.accessToken;
      session.provider = token.provider; // 제공자 정보 전달
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
