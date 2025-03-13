'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 책 데이터 타입 정의
interface BookLog {
  id: string;
  title: string;
  authors: string | string[]; // 타입을 더 유연하게 변경
  thumbnail: string | null;
  createId: string;
  publisher: string;
}

interface BookLogsResponse {
  totalCount: number;
  logs: BookLog[];
}

const MyLibrary = () => {
  const router = useRouter();
  const [isOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('전체');
  const [bookLogs, setBookLogs] = useState<BookLog[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [, setIsTokenExpired] = useState<boolean>(false);

  // statusMap을 useMemo로 감싸서 메모이제이션
  const statusMap = useMemo<{ [key: string]: string }>(() => {
    return {
      전체: '',
      읽고픈: 'ABANDONED',
      읽는중: 'READING',
      완독: 'COMPLETED',
      포기: 'GAVE_UP ',
    };
  }, []);

  // 로그인 페이지로 이동
  const handleLoginRedirect = () => {
    router.push('/login'); // 로그인 페이지 경로에 맞게 수정 필요
  };

  // 책 데이터 가져오기
  const fetchBooks = async (status: string = '') => {
    setIsLoading(true);
    setError(null);
    setIsTokenExpired(false);

    try {
      // 토큰 확인
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setIsTokenExpired(true);
        throw new Error('로그인이 필요합니다.');
      }

      const params = new URLSearchParams({
        page: '0',
        size: '100',
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

      if (response.status === 401 || response.status === 403) {
        setIsTokenExpired(true);
        localStorage.removeItem('accessToken'); // 만료된 토큰 삭제
        throw new Error('로그인 세션이 만료되었습니다. 다시 로그인해 주세요.');
      }

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
      setError(`로그인이 필요합니다`);
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

  const TokenExpiredMessage = () => (
    <div className="w-full max-w-6xl flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-2">로그인 세션이 만료되었습니다</h3>
        <p className="text-gray-600">서비스를 계속 이용하시려면 다시 로그인해 주세요.</p>
      </div>
      <Button
        onClick={handleLoginRedirect}
        className="bg-[#215B32] hover:bg-[#183c23] text-white px-8 py-2 rounded-lg text-lg"
      >
        로그인하러 가기
      </Button>
    </div>
  );

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

      <main className="relative z-10 pt-[8rem] flex flex-col flex-grow">
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

        <div className="flex-grow flex flex-col w-full justify-center items-center bg-white px-16 py-8">
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
              <TokenExpiredMessage />
            </div>
          ) : bookLogs.length === 0 ? (
            <div className="w-full max-w-6xl text-center py-16">
              <p className="text-xl text-gray-500">등록된 책이 없습니다.</p>
              <p className="text-gray-400 mt-2">새로운 책을 추가해 보세요.</p>
            </div>
          ) : (
            /* 책 그리드 */
            <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {bookLogs.map((book) => {
                // 이미지 URL 및 관련 정보 로깅
                console.log('책 정보:', {
                  title: book.title,
                  thumbnailUrl: book.thumbnail,
                  thumbnailType: typeof book.thumbnail,
                  thumbnailExists: !!book.thumbnail,
                });

                return (
                  <div
                    key={book.createId}
                    className="flex flex-col items-center transform transition-transform duration-300 hover:scale-105"
                  >
                    <Link href={`/detailmylibrary?id=${book.id}`} className="w-full no-underline">
                      <div className="w-full aspect-[3/4] relative mb-3 cursor-pointer group">
                        {book.thumbnail ? (
                          <Image
                            src={book.thumbnail} // 모든 공백 제거
                            alt={book.title}
                            fill
                            priority
                            unoptimized
                            className="object-cover rounded-md shadow-md"
                            onLoadingComplete={(img) => {
                              console.log('이미지 로딩 성공:', {
                                src: img.src,
                                너비: img.naturalWidth,
                                높이: img.naturalHeight,
                              });
                            }}
                            onError={(e) => {
                              console.error('이미지 로딩 오류:', {
                                src: e.currentTarget.src,
                                오류: e,
                              });
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md shadow-md">
                            <span className="text-gray-400">이미지 없음</span>
                          </div>
                        )}
                      </div>
                      <div className="w-full text-left ">
                        <div className="font-medium text-gray-900 truncate">{book.title}</div>
                        <div className="text-sm text-gray-500 truncate">{book.authors}</div>
                        <div className="text-sm text-gray-400 truncate">{book.publisher}</div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          <Link href="/newbook" className="mt-[7.37rem] no-underline">
            <div className="flex justify-center items-center shrink-0 w-[18.5rem] h-16">
              <Button className="flex text-center w-full h-full px-4 py-2 rounded-[10rem] border-[#215B32] border-[2px] text-[#215B32] hover:bg-green-700 bg-white text-xl font-bold">
                <PlusCircle size={28} /> 신규 책 추가
              </Button>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default MyLibrary;
