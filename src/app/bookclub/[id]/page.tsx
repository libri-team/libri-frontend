'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen } from 'lucide-react';
import Navigation from '@/components/Navigation';
import DeleteClubModal from '@/components/bookclub/DeleteModal';

interface Member {
  id: number;
  uniqueId: string;
  nickname: string;
  roleType: string;
}

interface Rule {
  dateCount: number;
  ruleStatus: string;
  bookCount: number;
  rule: string;
}

interface BookClub {
  clubId: number;
  clubName: string;
  fileUrl: string;
  members: Member[];
  rules: Rule[];
}

// 규칙 표시 텍스트 생성
const getRuleDisplayText = (rule: Rule): string => {
  if (!rule) return '';

  let period = '';
  switch (rule.ruleStatus) {
    case 'DAY':
      period = '일';
      break;
    case 'WEEK':
      period = '주';
      break;
    case 'MONTH':
      period = '월';
      break;
    case 'YEAR':
      period = '년';
      break;
    default:
      period = '일';
  }

  return `${rule.dateCount}${period}에 한 권 읽기`;
};

const BookClubDetail = () => {
  const params = useParams();
  const id = params.id as string;
  const [bookClub, setBookClub] = useState<BookClub | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 클라이언트 렌더링 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const fetchBookClub = async () => {
      try {
        setLoading(true);

        // 토큰 직접 사용 (실제 앱에서는 보안 처리 필요)
        const token = localStorage.getItem('accessToken');

        const response = await fetch(`https://dev-api.libri.kr/club/${id}`, {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch book club');
        }

        const data = await response.json();
        setBookClub(data);
      } catch (error) {
        console.error('Error fetching book club:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBookClub();
  }, [id, isClient]);

  // 모임 활동/관리자 이전 클릭 핸들러
  const handleManagementClick = () => {
    console.log('모임 활동 버튼 클릭됨');
    setShowDeleteModal(true);
    console.log('모달 상태:', true);
  };
  if (!isClient || loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );

  if (!bookClub)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">북클럽을 찾을 수 없습니다.</p>
      </div>
    );

  // Format rules for display (for memo section)
  const formattedRules = bookClub.rules.map((rule) => {
    if (rule.ruleStatus === 'DAY') {
      return `- 한 달에 ${rule.dateCount}일 읽기`;
    } else {
      return `- 한기(? 달) 책 ${rule.bookCount}권 부수기`;
    }
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 배경 및 타이틀 영역 */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={bookClub.fileUrl || '/logo.svg'}
            alt={bookClub.clubName}
            fill
            className={`w-full h-full object-cover ${!bookClub.fileUrl ? 'p-96' : ''}`}
          />
          <div className="absolute inset-0 bg-green-950 bg-opacity-20"></div>
        </div>

        {/* 네비게이션 */}
        <div className="relative z-10">
          <Navigation />
        </div>

        {/* 북클럽 타이틀 */}
        <div className="relative z-10 flex flex-col items-center text-center text-white py-16 px-4">
          <h1 className="text-2xl font-bold">{bookClub.clubName} 의 모임</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 - 중앙 정렬 */}
      <div className="max-w-[920px] w-full mx-auto px-4 flex-1">
        {/* 모임 목표 (Rules) 섹션 */}
        <div className="mb-8 mt-8">
          <div className="flex items-center mb-3">
            <BookOpen className="text-[#215B32] mr-2" />
            <h2 className="text-lg font-bold">모임 목표</h2>
          </div>
          <div className="bg-[#EEF0ED] rounded-[1rem] p-6 border-[1px] border-[#215B32]">
            <div className="space-y-3">
              {bookClub.rules.map((rule, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-[#215B32] mt-2 mr-3 flex-shrink-0"></div>
                  <div className="flex flex-col">
                    <span className="text-[#215B32] font-medium">{getRuleDisplayText(rule)}</span>
                    {rule.rule && rule.rule !== '규칙' && (
                      <p className="text-sm text-[#5A7D63] mt-1">{rule.rule}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 메모 (Rules) */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2">메모</h2>
          <div className="p-9 border-[1px] border-[#215B32] rounded-[1rem] bg-[#EEF0ED]">
            <h3 className="font-semibold mb-2 text-[#215B32]">Our Rules</h3>
            <ul>
              {formattedRules.map((rule, index) => (
                <li key={index} className="text-[#215B32]">
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 멤버 정보 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">멤버</h2>
            <button className="text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap justify-start gap-4">
            {bookClub.members.map((member) => (
              <div key={member.id} className="flex flex-col items-center">
                <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-gray-200 overflow-hidden flex items-start justify-center">
                  <Image
                    src="/profile.svg"
                    width={100}
                    height={100}
                    className="rounded-full"
                    alt="profile"
                  />
                </div>
                <div className="text-base mt-2 font-medium text-center">{member.uniqueId}</div>
                <p className="text-sm font-medium text-center text-gray-400">{member.nickname}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 독서 기록 */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2">독서 기록</h2>
          <div className="flex flex-wrap justify-start gap-2 mb-4">
            <button className="px-4 py-1 rounded-full text-sm bg-green-600 text-white">전체</button>
            <button className="px-4 py-1 rounded-full text-sm border border-gray-300">리뷰</button>
            <button className="px-4 py-1 rounded-full text-sm border border-gray-300">
              읽는 중
            </button>
            <button className="px-4 py-1 rounded-full text-sm border border-gray-300">완독</button>
            <button className="px-4 py-1 rounded-full text-sm border border-gray-300">포기</button>
          </div>

          <p className="text-sm text-start my-8 text-gray-400">전체 0개</p>
          <p className="text-center my-16 text-gray-400">독서 기록이 없습니다.</p>
        </div>

        {/* 책 추가 버튼 */}
        <div className="flex justify-center my-8">
          <Button className="flex bg-[#ffffff] hover:bg-[#215B32] text-center w-[18.5rem] h-[4rem] px-2 py-4 rounded-[10rem] border-[#215B32] border-[2px] text-[#215B32] hover:text-white  text-xl font-bold ">
            <PlusCircle size={28} className="mr-2" /> 책 추가하기
          </Button>
        </div>

        {/* 모임 활동/관리자 이전 */}
        <div
          className="text-center text-sm text-gray-400 my-8 cursor-pointer hover:text-gray-600 transition-colors"
          onClick={handleManagementClick}
        >
          모임 활동/관리자 이전
        </div>

        {/* 삭제 확인 모달 */}
        <DeleteClubModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          clubId={bookClub?.clubId || 0}
          clubName={bookClub?.clubName || ''}
        />
      </div>
    </div>
  );
};

export default BookClubDetail;
