import NextAuth from 'next-auth';
import NaverProvider from 'next-auth/providers/naver';

const handler = NextAuth(
  {
  providers: [
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID as string,
      clientSecret: process.env.NAVER_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/error',
    verifyRequest: '/',
    newUser: '/mylibrary'
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("http") && !url.startsWith(baseUrl)) 
        return baseUrl;
      if (url.startsWith("/")) 
        return `${baseUrl}${url}`;
      return baseUrl;
    }
  }
}
);

export { handler as GET, handler as POST };
