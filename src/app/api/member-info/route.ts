// app/api/member-info/route.ts
export async function GET() {
  console.log('API 라우트 호출됨'); // 여기에 로그 추가

  // 최신 토큰으로 업데이트 필요
  const token = process.env.ALADIN_API_TOKEN;
  console.log('사용 중인 토큰:', token); // 여기에 로그 추가

  try {
    console.log('API 요청 시작...'); // 여기에 로그 추가

    const response = await fetch('https://dev-api.libri.kr/member/my-info', {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    console.log('API 응답 상태:', response.status); // 여기에 로그 추가

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API 오류 (${response.status}):`, errorText); // 여기에 오류 로그 추가

      return new Response(JSON.stringify({ error: `API 서버 오류: ${response.status}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('API 응답 데이터:', data); // 여기에 로그 추가

    return Response.json(data);
  } catch (error) {
    console.error('API 라우트 오류:', error); // 여기에 오류 로그 추가

    return Response.json({ error: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}
