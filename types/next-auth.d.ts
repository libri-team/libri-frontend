import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Session 타입에 accessToken 속성 추가
   */
  interface Session {
    accessToken?: string | unknown;
    user: {
      /** 기본 user 필드 */
      id?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /** JWT 타입에 accessToken 속성 추가 */
  interface JWT {
    accessToken?: string | unknown;
  }
}
