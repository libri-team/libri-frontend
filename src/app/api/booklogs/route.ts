// app/api/booklogs/route.js (또는 route.ts)
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 요청 본문 추출
    const bookData = await request.json();

    // 토큰 가져오기
    const token = request.headers.get('authorization')?.split(' ')[1] || '';

    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // dev-api.libri.kr로 데이터 전송
    const response = await fetch('https://dev-api.libri.kr/booklogs', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        isbn: bookData.isbn || '',
        title: bookData.title || '',
        description: bookData.description || '',
        authors: bookData.authors || '',
        publisher: bookData.publisher || '',
        thumbnail: bookData.thumbnail || '',
        link: bookData.link || '',
        rating: bookData.rating || 0,
        status: bookData.status || 'ABANDONED',
        startDateTime: bookData.startDateTime || null,
        endDateTime: bookData.endDateTime || null,
        clubId: null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API 오류 응답:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const responseData = await response.json();
    console.log('북로그 생성 성공:', responseData);
    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('북로그 생성 오류:', error);
    return NextResponse.json({ error: '북로그 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
