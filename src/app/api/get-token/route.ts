// pages/api/convert-token.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  token: string;
  message?: string;
};

/**
 * 이 API는 NextAuth 세션 토큰을 백엔드 서버에서 사용할 수 있는 토큰으로 변환합니다.
 * 실제 구현에서는 백엔드 서버와 통신하여 토큰을 교환해야 합니다.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '허용되지 않는 메소드' });
  }

  try {
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({ error: '세션 토큰이 필요합니다' });
    }

    // 여기에서 백엔드 서버의 토큰 교환 API를 호출합니다
    // 이 예제에서는 직접 백엔드 API를 호출하여 토큰을 교환합니다
    const backendResponse = await fetch('https://dev-api.libri.kr/auth/test/token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    if (!backendResponse.ok) {
      throw new Error(`백엔드 토큰 교환 실패: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();

    // 백엔드에서 받은 토큰 반환
    res.status(200).json({
      token: backendData.token || `Bearer ${backendData.token}`,
      message: '토큰 변환 성공',
    });
  } catch (error) {
    console.error('토큰 변환 오류:', error);
    res.status(500).json({
      error: `토큰 변환 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}
