// app/api/create-unique-id/route.ts
export async function POST(request: Request) {
  console.log('고유 ID 생성 API 라우트 호출됨');

  try {
    // 요청 본문 파싱 시도
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('요청 본문 파싱 오류:', e);
      return Response.json({ error: '유효하지 않은 요청 형식입니다.' }, { status: 400 });
    }

    const { uniqueId } = body;
    console.log('요청된 고유 ID:', uniqueId);

    if (!uniqueId || typeof uniqueId !== 'string' || uniqueId.trim() === '') {
      console.error('유효하지 않은 고유 ID');
      return Response.json({ error: '유효한 고유 ID를 입력해주세요.' }, { status: 400 });
    }

    // 여기에 최신 토큰 필요
    const token = process.env.ALADIN_API_TOKEN;
    // API 서버로 요청 전송
    const response = await fetch('https://dev-api.libri.kr/member/create/unique-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ uniqueId }),
    });

    console.log('API 응답 상태:', response.status);

    // 응답 본문 가져오기
    let responseText;
    try {
      responseText = await response.text();
      console.log('API 응답 텍스트:', responseText);
    } catch (e) {
      console.error('응답 본문 읽기 오류:', e);
    }

    if (!response.ok) {
      console.error(`API 오류 (${response.status}):`, responseText || '응답 본문 없음');

      return Response.json(
        { error: `고유 ID 생성 중 오류가 발생했습니다: ${response.status}` },
        { status: response.status },
      );
    }

    // 성공 응답 처리
    let responseData;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error('JSON 파싱 오류:', e);
      return Response.json(
        { error: '서버 응답을 처리하는 중 오류가 발생했습니다.' },
        { status: 500 },
      );
    }

    return Response.json(responseData);
  } catch (error) {
    console.error('API 라우트 처리 중 예외 발생:', error);

    return Response.json({ error: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}
