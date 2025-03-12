'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import BookClubCard from '@/components/BookClubCard';
import { Button } from '@/components/ui/button';

// 클럽 인터페이스 정의
interface Rule {
  dateCount: number;
  ruleStatus: string;
  bookCount: number;
  rule: string;
}

interface Club {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  fileUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  rules?: Rule[];
}

// API 응답 인터페이스 정의
interface ApiResponse {
  content?: Club[];
  totalElements?: number;
  totalPages?: number;
  [key: string]: unknown;
}

/**
 * API에서 북클럽 데이터를 가져오는 함수
 * @param page - 페이지 번호
 * @param size - 페이지당 항목 수
 * @returns API 응답 데이터
 */
const fetchClubsFromAPI = async (page = 1, size = 10): Promise<ApiResponse> => {
  try {
    // 토큰 가져오기
    let token: string | null = null;
    const possibleKeys: string[] = [
      'token',
      'access_token',
      'accessToken',
      'jwtToken',
      'jwt',
      'authToken',
      'bearerToken',
    ];
    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed === 'object' && parsed !== null) {
            token = parsed.token || parsed.access_token || parsed.jwt || parsed;
          } else {
            token = parsed;
          }
        } catch {
          token = value;
        }
        break;
      }
    }

    if (!token) {
      const memberInfoString = localStorage.getItem('memberInfo');
      if (memberInfoString) {
        try {
          const memberInfo = JSON.parse(memberInfoString);
          token = memberInfo.token || memberInfo.access_token || memberInfo.jwt;
        } catch (error) {
          console.error('memberInfo 파싱 오류:', error);
        }
      }
    }

    if (!token) {
      throw new Error('인증 정보를 찾을 수 없습니다.');
    }

    const response = await fetch(`https://dev-api.libri.kr/club?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    console.log('API 응답 원본 데이터:', data);

    // ID 값 특별히 로깅
    if (Array.isArray(data)) {
      data.forEach((club, index) => {
        console.log(`클럽 ${index + 1} ID:`, club.id);
        console.log(`클럽 ${index + 1} 세부정보:`, {
          id: club.id,
          name: club.name,
          description: club.description,
          fileUrl: club.fileUrl,
          rules: club.rules,
        });
      });
    }

    return data;
  } catch (error) {
    console.error('API 호출 실패:', error);
    throw error;
  }
};

/**
 * 독서 모임 목록 페이지 컴포넌트
 */
export default function BookClubPage() {
  const router = useRouter();
  const [isOpen] = useState<boolean>(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [, setIsTokenExpired] = useState<boolean>(false);

  // API에서 클럽 데이터 가져오기
  useEffect(() => {
    const getClubs = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchClubsFromAPI(currentPage, 10);

        // API 응답 구조에 따라 데이터 처리 방식이 다를 수 있음
        if (result.content) {
          // 페이지네이션 구조인 경우
          console.log('페이지네이션 데이터 구조:', result);

          const mappedClubs = result.content.map((club) => ({
            id: club.id,
            name: club.name || '제목 없음',
            description: club.description || '설명 없음',
            memberCount: club.memberCount || 0,
            fileUrl: club.fileUrl,
            createdAt: club.createdAt,
            updatedAt: club.updatedAt,
            rules: club.rules,
          }));

          console.log('변환된 클럽 데이터:', mappedClubs);
          setClubs(mappedClubs);

          setTotalCount(result.totalElements || result.content.length);
          setTotalPages(result.totalPages || 1);
        } else if (Array.isArray(result)) {
          // 결과가 직접 배열로 오는 경우
          console.log('배열 형태의 데이터:', result);

          const mappedClubs = result.map((club) => ({
            id: club.id,
            name: club.name || '제목 없음',
            description: club.description || '설명 없음',
            memberCount: club.memberCount || 0,
            fileUrl: club.fileUrl,
            createdAt: club.createdAt,
            updatedAt: club.updatedAt,
            rules: club.rules,
          }));

          console.log('변환된 클럽 데이터:', mappedClubs);
          setClubs(mappedClubs);

          setTotalCount(result.length);
        } else {
          // 예상치 못한 응답 형식
          console.error('예상치 못한 응답 형식:', result);
          throw new Error('예상치 못한 API 응답 형식');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '독서 모임 정보를 불러오는데 실패했습니다.';
        console.error('클럽 데이터 가져오기 실패:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    getClubs();
  }, [currentPage]);

  /**
   * 클럽 카드 클릭 핸들러
   * @param id - 클럽 ID
   */
  const handleClubClick = (id: number): void => {
    console.log(`클릭한 클럽 ID: ${id}`);
    router.push(`/bookclub/${id}`);
  };

  // 로그인 페이지로 이동
  const handleLoginRedirect = () => {
    router.push('/login'); // 로그인 페이지 경로에 맞게 수정 필요
  };

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
          My Book Club
        </h1>
      </div>

      <main className="relative z-10 pt-[5.69rem] flex flex-col flex-grow">
        {/* 헤더 영역 */}
        <div className="relative text-center mb-10">
          <h2 className="text-[2.375rem] font-semibold text-gray-800">나의 독서 모임</h2>
          <p className="text-[1.125rem] text-[#737373] mt-2">
            같이 읽는 즐거움, 더 오래 기억되는 이야기
          </p>
        </div>

        <div className="flex-grow flex flex-col w-full justify-center items-center bg-white px-16 py-8">
          {/* 모임 수량 표시 */}
          <div className="w-full max-w-6xl mb-6">
            <p className="text-lg font-medium text-gray-800">전체 {totalCount}개</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#215B32]"></div>
            </div>
          ) : error ? (
            <div className="w-full max-w-6xl p-4 bg-red-100 text-red-700 rounded-md">
              <TokenExpiredMessage />
            </div>
          ) : clubs.length === 0 ? (
            <div className="w-full max-w-6xl text-center py-16">
              <p className="text-xl text-gray-500">참여 중인 독서 모임이 없습니다.</p>
              <p className="text-gray-400 mt-2">새로운 모임을 만들어 보세요.</p>
            </div>
          ) : (
            <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {clubs.map((club) => (
                <div
                  key={club.id}
                  className="flex flex-col transform transition-transform duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => handleClubClick(club.id)}
                  role="button"
                  aria-label={`${club.name} 독서 모임 상세보기`}
                >
                  <BookClubCard
                    id={club.id}
                    name={club.name}
                    description={club.description}
                    memberCount={club.memberCount}
                    createdAt={club.createdAt}
                    fileUrl={club.fileUrl}
                  />
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 (필요한 경우) */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-md bg-white text-gray-700 border border-gray-300 disabled:opacity-50"
                  aria-label="이전 페이지"
                >
                  이전
                </button>

                <span className="px-4 py-2 rounded-md bg-white text-gray-700 border border-gray-300">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-md bg-white text-gray-700 border border-gray-300 disabled:opacity-50"
                  aria-label="다음 페이지"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          <Link href="/addbookclub" className="mt-[7.37rem] no-underline">
            <div className="flex justify-center items-center shrink-0 w-[18.5rem] h-16">
              <Button className="flex text-center w-full h-full px-4 py-2 rounded-[10rem] border-[#215B32] border-[2px] text-[#215B32] hover:bg-green-700 hover:text-white bg-white text-xl font-bold">
                <PlusCircle size={28} className="mr-2" /> 새 모임 만들기
              </Button>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
