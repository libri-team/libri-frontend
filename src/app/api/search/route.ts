// /app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  // URL에서 쿼리 매개변수 가져오기
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword');
  const page = searchParams.get('page') || '1';
  const size = searchParams.get('size') || '10';

  // 필수 키워드 검증
  if (!keyword) {
    return NextResponse.json({ error: '검색어(keyword)는 필수 매개변수입니다.' }, { status: 400 });
  }

  const API_TOKEN = process.env.ALADIN_API_TOKEN;
  try {
    // axios를 사용하여 API 요청
    const response = await axios.get('https://dev-api.libri.kr/api/aladin/search', {
      params: {
        keyword,
        page,
        size,
      },
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('도서 검색 오류:', error);

    // axios 오류 처리
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || '도서 검색 중 오류가 발생했습니다.';

      return NextResponse.json({ error: message }, { status });
    }

    return NextResponse.json({ error: '도서 검색 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
