'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// 책 데이터 타입 정의
interface BookLog {
  id: string;
  title: string;
  authors: string[];
  thumbnail: string | null;
  createId: string;
}

interface BookLogsResponse {
  totalCount: number;
  logs: BookLog[];
}

const MyLibrary = () => {
  const [isOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('전체');
  const [bookLogs, setBookLogs] = useState<BookLog[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // statusMap을 useMemo로 감싸서 메모이제이션
  const statusMap = useMemo<{ [key: string]: string }>(() => {
    return {
      전체: '',
      읽고픈: 'WISHLIST',
      읽는중: 'READING',
      완독: 'COMPLETED',
      포기: 'ABANDONED',
    };
  }, []);

  // 책 데이터 가져오기
  const fetchBooks = async (status: string = '') => {
    setIsLoading(true);
    setError(null);

    try {
      // 토큰 확인
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const params = new URLSearchParams({
        page: '0',
        size: '5',
        isPrivate: 'true',
      });

      if (status) {
        params.append('status', status);
      }

      // 전체 URL 출력
      const url = `https://dev-api.libri.kr/booklogs?${params.toString()}`;
      console.log('요청 URL:', url);
      console.log('인증 토큰:', token);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('상세 에러:', errorText);
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data: BookLogsResponse = await response.json();
      console.log('응답 데이터:', data);

      // 데이터 상태 업데이트
      setBookLogs(data.logs);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error('전체 요청 오류:', err);
      setError(`데이터를 불러오는 중 오류가 발생했습니다: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 필터 변경 시 책 데이터 다시 가져오기
  useEffect(() => {
    const mappedStatus = statusMap[activeFilter];
    fetchBooks(mappedStatus);
  }, [activeFilter, statusMap]); // statusMap을 의존성 배열에 추가

  // 필터 항목 목록
  const filters = ['전체', '읽고픈', '읽는중', '완독', '포기'];

  return (
    <div
      className={`min-h-screen w-full bg-[#eef0ed] min-w-sm relative transition-all duration-300 ease-in-out flex flex-col ${
        isOpen ? 'scale-[0.98] rounded-xl overflow-hidden' : 'scale-100'
      }`}
    >
      <Navigation isDrawerOpen={isOpen} />

      {/* 백그라운드 텍스트 */}
      <div className="absolute top-48 left-0 right-0 z-0 flex justify-center">
        <h1 className="font-playfair text-[17.5rem] font-normal leading-[22.75rem] text-[#183C23] opacity-15 whitespace-nowrap">
          My Library
        </h1>
      </div>

      <main className="relative z-10 pt-[11rem] flex flex-col flex-grow">
        {/* 헤더 영역 */}
        <div className="relative text-center mb-10">
          <h2 className="text-[2.375rem] font-semibold text-gray-800">내 서재</h2>
          <p className="text-[1.125rem] text-[#737373] mt-2">
            읽고 싶은, 읽고 있는 또는 다 읽은 책을
          </p>

          {/* 필터 버튼 */}
          <div className="flex justify-center space-x-2 mt-6">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`
                  px-6 py-2 
                  rounded-full 
                  text-sm 
                  font-medium 
                  transition-colors
                  ${
                    filter === activeFilter
                      ? 'bg-[#215B32] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-grow flex flex-col w-full justify-center items-center bg-white px-16 pt-8 pb-16">
          {/* 책 수량 표시 및 정렬 */}
          <div className="w-full max-w-6xl mb-6">
            <p className="text-lg font-medium text-gray-800">전체 {totalCount}권</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#215B32]"></div>
            </div>
          ) : error ? (
            <div className="w-full max-w-6xl p-4 bg-red-100 text-red-700 rounded-md">
              <p className="font-medium">오류 발생</p>
              <p>{error}</p>
            </div>
          ) : bookLogs.length === 0 ? (
            <div className="w-full max-w-6xl text-center py-16">
              <p className="text-xl text-gray-500">등록된 책이 없습니다.</p>
              <p className="text-gray-400 mt-2">새로운 책을 추가해 보세요.</p>
            </div>
          ) : (
            /* 책 그리드 */
            <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {bookLogs.map((book) => (
                <div key={book.createId} className="flex flex-col items-center">
                  {/* 책 커버 이미지 */}
                  <div className="w-full aspect-[3/4] relative mb-3 cursor-pointer group">
                    {book.thumbnail ? (
                      <Image
                        src={book.thumbnail}
                        alt={book.title}
                        fill
                        className="object-cover rounded-md shadow-md"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md shadow-md">
                        <span className="text-gray-400">이미지 없음</span>
                      </div>
                    )}

                    {/* 호버 오버레이 */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-md flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button className="bg-white text-gray-800 hover:bg-gray-100" size="sm">
                          상세보기
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 책 정보 */}
                  <div className="w-full text-left">
                    <div className="font-medium text-gray-900 truncate">{book.title}</div>
                    <div className="text-sm text-gray-500 truncate">{book.authors.join(', ')}</div>
                    <div className="text-sm text-gray-400 truncate">ID: {book.id}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link href="/newbook" className="mt-[7.37rem] no-underline">
            <div className="flex justify-center items-center shrink-0 w-[18.5rem] h-16">
              <Button className="flex text-center w-full h-full px-4 py-2 rounded-[10rem] border-[#215B32] border-[2px] text-[#215B32] hover:bg-green-700 bg-white text-xl font-bold">
                신규 책 추가하기
              </Button>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default MyLibrary;
