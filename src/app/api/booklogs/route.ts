// app/api/booklogs/route.ts
export async function GET(request: Request) {
  console.log('도서 목록 조회 API 라우트 호출됨');

  try {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '0';
    const size = url.searchParams.get('size') || '100';
    const status = url.searchParams.get('status') || '';

    console.log(`요청 파라미터: page=${page}, size=${size}, status=${status}`);

    // API 요청을 위한 URL 구성
    let apiUrl = `https://dev-api.libri.kr/booklogs?page=${page}&size=${size}`;
    if (status) {
      apiUrl += `&status=${status}`;
    }

    // 토큰 설정 (실제 사용 시 유효한 토큰으로 교체 필요)
    const token = process.env.ALADIN_API_TOKEN;
    console.log('사용 중인 토큰:', token);

    console.log('API 요청 URL:', apiUrl);

    // API 요청 보내기
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    console.log('API 응답 상태:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API 오류 (${response.status}):`, errorText);

      // 401 오류는 인증 문제로 간주
      if (response.status === 401) {
        return Response.json(
          { error: '인증 토큰이 만료되었습니다. 다시 로그인해주세요.' },
          { status: 401 },
        );
      }

      return Response.json(
        { error: `도서 목록을 가져오는 중 오류가 발생했습니다: ${response.status}` },
        { status: response.status },
      );
    }

    // 성공 응답 처리
    const data = await response.json();
    console.log('도서 목록 데이터 수신:', data.totalCount);

    return Response.json(data);
  } catch (error) {
    console.error('API 라우트 처리 중 예외 발생:', error);

    return Response.json({ error: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}
