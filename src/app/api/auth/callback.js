// pages/api/auth/callback.js
import { setCookie } from 'cookies-next';

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: '인증 코드가 없습니다.' });
  }

  try {
    // 백엔드 API에 인증 코드를 전달하여 토큰 요청
    const tokenResponse = await fetch('https://dev-api.libri.kr/login/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('토큰 응답 오류:', errorData);
      return res.status(tokenResponse.status).json({ error: '토큰을 가져오는데 실패했습니다.' });
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token } = tokenData;

    if (!access_token) {
      return res.status(400).json({ error: '유효한 액세스 토큰이 없습니다.' });
    }

    // 토큰을 쿠키에 저장 (클라이언트 측에서 접근 가능하도록)
    setCookie('access_token', access_token, { req, res, maxAge: 60 * 60 * 24, path: '/' });

    if (refresh_token) {
      setCookie('refresh_token', refresh_token, { req, res, maxAge: 60 * 60 * 24 * 30, path: '/' });
    }

    // 사용자 정보 가져오기
    const userResponse = await fetch('https://dev-api.libri.kr/api/members/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('사용자 정보 가져오기 실패:', userResponse.status);
      // 사용자 정보를 가져오는데 실패해도 토큰은 저장되었으므로 홈으로 리다이렉트
      return res.redirect('/');
    }

    const userData = await userResponse.json();

    // 사용자 이름/이메일 저장
    if (userData.name) {
      setCookie('user_name', userData.name, { req, res, maxAge: 60 * 60 * 24, path: '/' });
    }
    if (userData.email) {
      setCookie('user_email', userData.email, { req, res, maxAge: 60 * 60 * 24, path: '/' });
    }

    // 로그인 성공 후 홈페이지로 리다이렉트
    return res.redirect('/?login=success');
  } catch (error) {
    console.error('인증 처리 중 오류:', error);
    return res.status(500).json({ error: '인증 처리 중 오류가 발생했습니다.' });
  }
}
