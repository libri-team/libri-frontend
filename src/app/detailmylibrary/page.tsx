'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { format, set } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import MemberAddDrawer from '@/components/bookclub/MemberAddDrawer';

// 책 데이터 인터페이스 정의
interface BookDetail {
  id: string;
  readingLogId: string;
  title: string;
  isbn: string;
  description: string;
  authors: string;
  publisher: string;
  thumbnail: string | null;
  link: string;
  rating: number;
  status: string;
  startDateTime: string;
  endDateTime: string;
  members: Member[];
  pendingMembers: PendingMember[];
}
// 함께 읽는 멤버 인터페이스
interface Member {
  memberId: number;
  memberName: string;
}
// 초대 중인 멤버 인터페이스
interface PendingMember {
  memberId: number;
  memberName: string;
}

// 독서 기록 인터페이스 정의
interface ReadingPost {
  id: string;
  content: string;
  isTalkingPoint: boolean;
  createdDatetime: string;
  modifiedDatetime: string;
  isEditable: boolean;
  fileUrl: string | null;
}

// User 인터페이스 정의
interface User {
  id: number;
  nickname: string;
  uniqueId: string;
}

// 날짜 및 시간 선택 컴포넌트
const DateTimeSelector = ({
  selectedDateTime,
  onDateTimeChange,
  placeholder = 'YYYY.MM.DD 00:00',
  label,
}: {
  selectedDateTime?: Date;
  onDateTimeChange: (date?: Date) => void;
  placeholder?: string;
  label: string;
}) => {
  // 선택된 날짜와 시간을 상태로 관리
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(selectedDateTime);
  const [selectedTime, setSelectedTime] = useState<string>(
    selectedDateTime ? format(selectedDateTime, 'HH:mm') : '00:00',
  );

  // 날짜와 시간을 결합하는 함수
  const combineDateTime = (date?: Date, time?: string) => {
    if (!date) return undefined;

    const [hours, minutes] = (time || '00:00').split(':').map(Number);
    return set(date, { hours, minutes, seconds: 0, milliseconds: 0 });
  };

  // 날짜 선택 핸들러
  const handleDateSelect = (date?: Date) => {
    const newDateTime = combineDateTime(date, selectedTime);
    setSelectedDate(date);
    onDateTimeChange(newDateTime);
  };

  // 시간 변경 핸들러
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setSelectedTime(newTime);

    const newDateTime = combineDateTime(selectedDate, newTime);
    onDateTimeChange(newDateTime);
  };

  return (
    <div>
      <div className="text-gray-500 text-sm mb-2">{label}</div>
      <div className="flex w-72 h-12 items-center ">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal w-full bg-white',
                !selectedDateTime && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDateTime ? (
                format(selectedDateTime, 'yyyy.MM.dd HH:mm')
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 m-2 flex flex-col space-y-2 bg-white">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
            />
            <div className="flex items-center p-2 border-t">
              <Input
                type="time"
                value={selectedTime}
                onChange={handleTimeChange}
                className="flex-grow"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

// 별점 컴포넌트
const RatingInput = ({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (value: number) => void;
}) => {
  const handleRatingChange = (value: number) => {
    if (rating === value) {
      setRating(0); // 같은 값을 클릭하면 초기화
    } else {
      setRating(value);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="text-gray-500 text-base">평점</div>
      <div className="rating rating-lg rating-half flex justify-around items-center w-[11.25rem] h-12 p-[0.625rem] flex-shrink-0 rounded-lg border border-[#D4D4D4]">
        <input type="radio" name="rating-10" className="rating-hidden" />
        {[...Array(10)].map((_, index) => (
          <input
            key={index}
            type="radio"
            name="rating-10"
            className={`mask mask-star-2 ${index % 2 === 0 ? 'mask-half-1' : 'mask-half-2'}`}
            style={{ backgroundColor: rating > index ? '#FFF598' : '#E5E5E5' }}
            checked={rating === index + 1}
            onChange={() => handleRatingChange(index + 1)}
          />
        ))}
      </div>
    </div>
  );
};

// 독서 기록 컴포넌트
const ReadingPostsSection = ({ bookData }: { bookData: BookDetail }) => {
  const [readingPosts, setReadingPosts] = useState<ReadingPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyTalkingPoints, setShowOnlyTalkingPoints] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC'>('DESC');
  const [nickname, setNickname] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    // 로컬 스토리지에서 회원 정보 가져오기
    const memberInfoString = localStorage.getItem('memberInfo');
    if (memberInfoString) {
      const memberInfo = JSON.parse(memberInfoString);
      setNickname(memberInfo.nickname);
    }
  }, []);

  // 독서 기록 불러오기 함수
  const fetchReadingPosts = async (
    bookLogId: string,
    isTalkingPoint?: boolean,
    sort: 'DESC' | 'ASC' = 'DESC',
    page: number = 0,
  ) => {
    try {
      // 로컬 스토리지에서 토큰 가져오기
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('토큰이 없습니다.');
        throw new Error('로그인이 필요합니다.');
      }

      // URL 파라미터 구성
      let url = `https://dev-api.libri.kr/reading-posts?page=${page}&bookLogId=${bookLogId}&sort=${sort}`;

      // 선택적 파라미터 추가
      if (isTalkingPoint === true) {
        url += `&isTalkingPoint=${isTalkingPoint}`;
      }

      console.log('API 호출 URL:', url);
      console.log('API 호출 토큰:', token.substring(0, 10) + '...');

      // API 호출
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('API 응답 상태:', response.status);

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data = await response.json();
      console.log('API 응답 데이터:', data);
      return data;
    } catch (error: any) {
      console.error('독서 기록 조회 오류:', error);
      throw new Error(`독서 기록을 불러오는 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  // 독서 기록 불러오기 실행 함수
  const loadReadingPosts = async () => {
    if (!bookData || !bookData.id) {
      console.log('책 데이터가 없어 독서 기록을 불러올 수 없습니다:', bookData);
      return;
    }

    setIsLoading(true);
    try {
      console.log('독서 기록 불러오기 시작:', {
        bookLogId: bookData.id,
        isTalkingPoint: showOnlyTalkingPoints,
        sort: sortOrder,
      });

      const result = await fetchReadingPosts(bookData.id, showOnlyTalkingPoints, sortOrder);

      console.log('독서 기록 불러오기 결과:', result);
      // 새로운 응답 형식에 맞게 데이터 처리
      setReadingPosts(result.readingPosts || []);
    } catch (err: any) {
      console.error('독서 기록 불러오기 오류 발생:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 및 필터/정렬 변경 시 기록 불러오기
  useEffect(() => {
    console.log('독서 기록 useEffect 트리거:', bookData?.id, showOnlyTalkingPoints, sortOrder);
    loadReadingPosts();
  }, [bookData, showOnlyTalkingPoints, sortOrder]);

  // 독서 기록 저장 함수
  const saveReadingPost = async () => {
    if (!newPostContent.trim() || !bookData) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      // API 요청 본문 준비
      const requestBody = {
        readingLogId: bookData.readingLogId,
        content: newPostContent,
        isTalkingPoint: false,
      };

      console.log('독서 기록 저장 요청:', requestBody);

      const response = await fetch('https://dev-api.libri.kr/reading-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      // 응답 처리
      const data = await response.json();
      console.log('독서 기록 저장 응답:', data);

      // ID를 성공적으로 받았으면 독서 기록을 다시 불러오기
      if (data.id) {
        setNewPostContent(''); // 입력 필드 초기화
        loadReadingPosts(); // 목록 새로고침
      }
    } catch (error) {
      console.error('독서 기록 저장 오류:', error);
      alert(`독서 기록을 저장하는 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  // 정렬 순서 변경 함수
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as 'DESC' | 'ASC');
  };

  // 탭 변경 함수
  const handleTabChange = (showTalkingPoints: boolean) => {
    setShowOnlyTalkingPoints(showTalkingPoints);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 메뉴 토글 함수
  const toggleMenu = (postId: string) => {
    if (isMenuOpen === postId) {
      setIsMenuOpen(null);
    } else {
      setIsMenuOpen(postId);
    }
  };

  // 독서 기록 수정 함수
  const editReadingPost = async (postId: string, content: string, isTalkingPoint: boolean) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const requestBody = {
        content,
        isTalkingPoint,
      };

      const response = await fetch(`https://dev-api.libri.kr/reading-posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      // 성공적으로 업데이트된 후 목록 새로고침
      loadReadingPosts();

      return true;
    } catch (error: any) {
      console.error('독서 기록 수정 오류:', error);
      alert(`독서 기록을 수정하는 중 오류가 발생했습니다: ${error.message}`);
      return false;
    }
  };

  // 독서 기록 삭제 함수
  const deleteReadingPost = async (postId: string) => {
    if (!confirm('정말로 이 독서 기록을 삭제하시겠습니까?')) {
      return false;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await fetch(`https://dev-api.libri.kr/reading-posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      // 삭제 후 목록 새로고침
      loadReadingPosts();
      alert('독서 기록이 삭제되었습니다.');

      return true;
    } catch (error: any) {
      console.error('독서 기록 삭제 오류:', error);
      alert(`독서 기록을 삭제하는 중 오류가 발생했습니다: ${error.message}`);
      return false;
    }
  };

  // Talking Point 토글 함수
  const toggleTalkingPoint = async (postId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const url = `https://dev-api.libri.kr/reading-posts/${postId}/talking-point`;
      const requestBody = {
        isTalkingPoint: !currentStatus,
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      // 토글 후 목록 새로고침
      loadReadingPosts();

      return true;
    } catch (error: any) {
      console.error('Talking Point 토글 오류:', error);
      alert(`Talking Point 상태를 변경하는 중 오류가 발생했습니다: ${error.message}`);
      return false;
    }
  };

  return (
    <div className="flex flex-col justify-center p-8 px-10 md:px-20 lg:px-80">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">독서 기록</h2>
        <div className="flex space-x-2">
          <select
            className="bg-transparent text-gray-700 py-2 px-2 rounded-md"
            value={sortOrder}
            onChange={handleSortChange}
          >
            <option value="DESC">최신순</option>
            <option value="ASC">오래된순</option>
          </select>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button
            className={`pb-2 ${!showOnlyTalkingPoints ? 'text-[#215B32] font-medium border-b-2 border-[#215B32]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleTabChange(false)}
          >
            전체보기
          </button>
          <button
            className={`pb-2 ${showOnlyTalkingPoints ? 'text-[#215B32] font-medium border-b-2 border-[#215B32]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleTabChange(true)}
          >
            Talking Point만 보기
          </button>
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#215B32]"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : readingPosts.length === 0 ? (
        // 독서 기록 없을 때 표시
        <div className="text-center py-16">
          <p className="text-gray-500 mb-1">독서 기록이 없습니다.</p>
          <p className="text-gray-400 text-sm">아래에서 첫 독서 기록을 남겨보세요.</p>
        </div>
      ) : (
        // 독서 기록 목록
        <div className="space-y-6">
          {readingPosts.map((post) => (
            <div
              key={post.id}
              className={`bg-white rounded-lg shadow p-4 ${post.isTalkingPoint ? 'border-2 border-[#215B32]' : ''}`}
            >
              <div className="flex mb-3 ">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-lg">{post.isEditable ? nickname : '사용자'}</p>
                  <p className="text-xs text-gray-500">{formatDate(post.createdDatetime)}</p>
                </div>
                <div className="ml-auto flex items-center gap-2  ">
                  {post.isTalkingPoint && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Talking Point
                    </span>
                  )}

                  {post.isEditable && (
                    <div className="relative">
                      <button
                        onClick={() => toggleMenu(post.id)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>

                      {isMenuOpen === post.id && (
                        <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-32">
                          <button
                            onClick={() => {
                              setIsMenuOpen(null);
                              const newContent = prompt('기록을 수정하세요', post.content);
                              if (newContent !== null && newContent.trim() !== '') {
                                editReadingPost(post.id, newContent, post.isTalkingPoint);
                              }
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            기록 수정
                          </button>
                          <button
                            onClick={() => deleteReadingPost(post.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
              {post.isEditable && (
                <div className="flex justify-end items-center mt-4 text-sm text-gray-500">
                  <input
                    type="checkbox"
                    id={`talking-point-${post.id}`}
                    checked={post.isTalkingPoint}
                    onChange={() => toggleTalkingPoint(post.id, post.isTalkingPoint)}
                    className="mr-2 h-4 w-4  text-[#215B32] focus:ring-[#215B32] bg-white"
                  />
                  <label htmlFor={`talking-point-${post.id}`} className="text-sm  text-gray-600">
                    Talking Point
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 독서 기록 입력창 */}
      <div className="border border-gray-200 bg-white rounded-xl p-3 mt-10 shadow-md">
        <div className="flex items-center">
          <input
            type="text"
            className="w-full bg-white border-none focus:outline-none focus:ring-0 placeholder-gray-400 py-2 px-3"
            placeholder="나의 독서 기록을 작성해 보세요."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && saveReadingPost()}
          />
          <Button
            className={`ml-2 ${newPostContent.trim() ? 'bg-[#215B32] hover:bg-[#183c23] text-white' : 'bg-gray-200 text-gray-500'}`}
            onClick={saveReadingPost}
            disabled={!newPostContent.trim()}
          >
            저장
          </Button>
        </div>
      </div>
    </div>
  );
};

const DetailMyLibraryContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [bookData, setBookData] = useState<BookDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const bookId = searchParams.get('id');

  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editStatus, setEditStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [memberIds, setMemberIds] = useState<number[]>([]);

  // 멤버 추가 드로어 상태
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);

  // 책 데이터 가져오기
  useEffect(() => {
    if (!bookId) return;

    const fetchBookDetail = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('로그인이 필요합니다.');
        }

        const response = await fetch(`https://dev-api.libri.kr/booklogs/${bookId}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`서버 오류: ${response.status}`);
        }

        const data = await response.json();
        setBookData(data);
      } catch (err: any) {
        console.error('데이터 요청 오류:', err);
        setError(`책 정보를 불러오는 중 오류가 발생했습니다: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetail();
  }, [bookId]);

  // 멤버 데이터 초기화
  useEffect(() => {
    if (bookData) {
      // 기존 멤버 데이터를 User 형태로 변환
      const initialMembers: User[] = bookData.members.map((member) => ({
        id: member.memberId,
        nickname: member.memberName,
        uniqueId: `user_${member.memberId}`, // API 형태에 맞게 가상의 uniqueId 생성
      }));
      setSelectedMembers(initialMembers);
    }
  }, [bookData]);

  // 멤버 선택 처리 함수
  const handleMembersSelect = (members: User[]) => {
    setSelectedMembers(members);
    // memberIds 상태도 업데이트
    const newMemberIds = members.map((member) => member.id);
    setMemberIds(newMemberIds);
  };
  // 멤버 제거 함수
  const handleRemoveMember = (memberId: number) => {
    const updatedMembers = selectedMembers.filter((member) => member.id !== memberId);
    setSelectedMembers(updatedMembers);
    setMemberIds(updatedMembers.map((member) => member.id));
  };

  // 날짜 포맷 함수
  const formatDate = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    // "2025-01-01 00:00:00" 형식에서 "2025.01.01" 형식으로 변환
    return dateTimeString.split(' ')[0].replace(/-/g, '.');
  };

  // 상태에 따른 스타일 및 텍스트
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: 'bg-[#DBEAFE]', text: 'text-blue-800', label: '완독' };
      case 'READING':
        return { bg: 'bg-[#D1FAE5]', text: 'text-green-800', label: '읽는중' };
      case 'ABANDONED':
        return { bg: 'bg-[#FFF3CD]', text: 'text-[#997404]', label: '읽고픈' };
      case 'GAVE_UP':
        return { bg: 'bg-[#FFE4E6]', text: 'text-red-800', label: '포기' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: '상태 정보 없음' };
    }
  };

  // 편집 모드 전환
  const toggleEditMode = () => {
    if (!isEditing && bookData) {
      // 편집 모드 진입 시 현재 데이터로 초기화
      setEditRating(bookData.rating || 0);
      setEditStatus(bookData.status || '');

      // 날짜 문자열을 Date 객체로 변환
      if (bookData.startDateTime) {
        setStartDate(new Date(bookData.startDateTime));
      }

      if (bookData.endDateTime) {
        setEndDate(new Date(bookData.endDateTime));
      }

      // 멤버 ID 목록 설정
      const newMemberIds = bookData.members.map((member) => member.memberId);
      setMemberIds(newMemberIds);

      console.log('편집 모드 진입:', {
        rating: bookData.rating,
        status: bookData.status,
        startDateTime: bookData.startDateTime,
        endDateTime: bookData.endDateTime,
        memberIds: newMemberIds,
      });
    }

    setIsEditing(!isEditing);
  };

  // 변경사항 저장
  const saveChanges = async () => {
    if (!bookData) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      // 선택된 날짜를 API 형식에 맞게 변환 ("2025-01-01 00:00:00" 형식)
      const formatDateForApi = (date?: Date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:00`;
      };

      // API 요청 본문 구성
      const requestBody = {
        rating: editRating,
        status: editStatus || bookData.status,
        startDateTime: formatDateForApi(startDate),
        endDateTime: formatDateForApi(endDate),
        memberIds: memberIds, // 선택된 멤버 ID 배열
      };

      console.log('책 정보 업데이트 요청:', requestBody);

      // PUT 요청 실행
      const response = await fetch(`https://dev-api.libri.kr/booklogs/${bookData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `서버 오류: ${response.status} ${errorData ? JSON.stringify(errorData) : ''}`,
        );
      }

      // 성공적으로 업데이트된 데이터 받기
      const updatedData = await response.json();
      console.log('책 정보 업데이트 성공:', updatedData);

      // 로컬 상태 업데이트
      setBookData({
        ...bookData,
        rating: editRating,
        status: editStatus || bookData.status,
        startDateTime: formatDateForApi(startDate),
        endDateTime: formatDateForApi(endDate),
        // 멤버 정보는 서버 응답에서 가져올 수 있지만, 이 예제에서는 간단히 처리
        members: selectedMembers.map((user) => ({
          memberId: user.id,
          memberName: user.nickname,
        })),
      });

      // 편집 모드 종료
      setIsEditing(false);

      // 성공 메시지 표시
      alert('책 정보가 성공적으로 업데이트되었습니다.');
    } catch (error: any) {
      // 오류 처리
      console.error('책 정보 업데이트 오류:', error);
      alert(`책 정보 업데이트 실패: ${error.message}`);
    }
  };

  // 상태값 변경 핸들러
  const handleStatusChange = (newStatus: string) => {
    setEditStatus(newStatus);
  };

  return (
    <div className="min-h-screen w-full bg-[#eef0ed] min-w-sm relative">
      {/* 네비게이션 */}
      <Navigation />

      <main className="max-w-[97%] flex flex-col justify-center mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#215B32]"></div>
          </div>
        ) : error ? (
          <div className="w-full p-4 bg-red-100 text-red-700 rounded-md">
            <p className="font-medium">오류 발생</p>
            <p>{error}</p>
          </div>
        ) : bookData ? (
          <>
            {/* 상단 책 정보 섹션 */}
            <div className="bg-white flex justify-center rounded-lg shadow-sm p-8 mb-8">
              <div className="flex w-full md:flex-row">
                {/* 책 이미지 */}
                <div className="  p-2 flex justify-center md:justify-center mb-6 md:mb-0">
                  <div className="relative md:w-64 md:h-96 w-48 h-72 overflow-hidden">
                    {bookData.thumbnail ? (
                      <Image
                        src={bookData.thumbnail}
                        alt={bookData.title}
                        fill
                        priority
                        unoptimized
                        className="object-contain rounded-md shadow-md"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md shadow-md">
                        <span className="text-gray-400">이미지 없음</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 책 정보 */}
                <div className="md:w-full md:pl-8">
                  {isEditing ? (
                    /* 편집 모드 */
                    <>
                      <div className="flex items-center mb-2 ">
                        <div className="flex space-x-2 mb-2">
                          {['ABANDONED', 'READING', 'COMPLETED', 'GAVE_UP'].map((status) => {
                            const style = getStatusStyle(status);
                            return (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                className={`px-3 py-1 rounded-full ${style.bg} ${style.text} ${
                                  editStatus === status ? 'ring-2 ring-gray-500' : ''
                                }`}
                              >
                                {style.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <h1 className="text-3xl font-bold text-gray-800 mb-2">{bookData.title}</h1>
                      <p className="text-gray-600 mb-2">
                        {bookData.authors} 저자 · {bookData.publisher} 출판
                      </p>
                      <p className="text-gray-500 mb-4">
                        ISBN {bookData.description || '정보 없음'}
                      </p>

                      <div className="flex gap-5 mb-6 ">
                        <DateTimeSelector
                          selectedDateTime={startDate}
                          onDateTimeChange={setStartDate}
                          label="시작일"
                        />
                        <DateTimeSelector
                          selectedDateTime={endDate}
                          onDateTimeChange={setEndDate}
                          label="마감일"
                        />
                      </div>
                      <div className="flex items-center mb-6">
                        <RatingInput rating={editRating} setRating={setEditRating} />
                      </div>

                      {/* 멤버 ID 선택 영역 */}
                      <div className="mb-6">
                        <div className="text-gray-500 text-base mb-2">함께 읽는 멤버</div>
                        <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-white">
                          {selectedMembers.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center bg-green-50 text-green-700 rounded-full px-3 py-1 border border-green-100"
                            >
                              <span className="text-sm font-medium">{member.nickname}</span>
                              <button
                                className="ml-2 text-red-500 hover:text-red-700"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                          {/* 멤버 추가 버튼 */}
                          <button
                            className="flex items-center bg-white text-[#215B32] rounded-full px-3 py-1 border border-dashed border-[#215B32] hover:bg-green-50"
                            onClick={() => setIsDrawerOpen(true)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm font-medium">멤버 추가</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <Button
                          className="bg-[#215B32] hover:bg-[#183c23] text-white font-medium px-5 py-2 rounded-lg transition-colors duration-200"
                          onClick={saveChanges}
                        >
                          저장하기
                        </Button>
                        <Button
                          className="border-2 border-[#215B32] bg-white text-[#215B32] hover:bg-gray-100 font-medium px-5 py-2 rounded-lg transition-colors duration-200"
                          onClick={toggleEditMode}
                        >
                          취소
                        </Button>
                      </div>
                    </>
                  ) : (
                    /* 보기 모드 */
                    <>
                      <div className="flex items-center justify-between mb-2 ">
                        <span
                          className={`px-3 py-1 ${getStatusStyle(bookData.status).bg} ${getStatusStyle(bookData.status).text} text-sm font-medium rounded-full`}
                        >
                          {getStatusStyle(bookData.status).label}
                        </span>
                        <Button
                          className="border-2 border-[#215B32] bg-[#ffffff] text-[#215B32] hover:text-[#ffffff] hover:bg-[#215B32] "
                          onClick={toggleEditMode}
                        >
                          책 정보 수정
                        </Button>
                      </div>
                      <h1 className="text-3xl font-bold text-gray-800 mb-2">{bookData.title}</h1>
                      <p className="text-gray-600 mb-2">
                        {bookData.authors} 저자 · {bookData.publisher} 출판
                      </p>
                      <p className="text-gray-500 ">ISBN {bookData.description || '정보 없음'}</p>

                      <div className="flex gap-3 my-4">
                        <div className="flex text-gray-500 text-base items-center">날짜</div>
                        <div className="flex w-72 h-12 px-4 py-3 justify-start items-center gap-2 rounded-lg border border-gray-200 bg-white">
                          <CalendarIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-base">
                            {formatDate(bookData.startDateTime || '')} -{' '}
                            {formatDate(bookData.endDateTime || '')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center mb-6">
                        <RatingInput rating={bookData.rating || 0} setRating={setEditRating} />
                      </div>

                      {/* 함께 읽는 멤버 섹션 */}
                      <div className="border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-green-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                          </div>
                          <h3 className="text-gray-700 font-medium text-lg">함께 읽는 멤버</h3>
                          {bookData.pendingMembers.length > 0 && (
                            <span className="ml-auto bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded-full border border-yellow-200">
                              {bookData.pendingMembers.length}명 초대중
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 ml-10">
                          {bookData.members.length > 0 ? (
                            bookData.members.map((member) => (
                              <div
                                key={member.memberId}
                                className="flex items-center bg-green-50 text-green-700 rounded-full px-3 py-1 border border-green-100"
                              >
                                <span className="text-sm font-medium">{member.memberName}</span>
                              </div>
                            ))
                          ) : bookData.pendingMembers.length === 0 ? (
                            <p className="text-gray-400 text-sm italic">
                              함께 읽는 멤버가 없습니다
                            </p>
                          ) : null}

                          {bookData.pendingMembers.map((member) => (
                            <div
                              key={member.memberId}
                              className="flex items-center bg-gray-50 text-gray-500 rounded-full px-3 py-1 border border-dashed border-gray-300"
                            >
                              <span className="text-sm">{member.memberName}</span>
                              <span className="ml-1 text-xs text-gray-400">(초대중)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 독서 기록 섹션 */}
            {bookData && <ReadingPostsSection bookData={bookData} />}

            {/* 멤버 추가 드로어 */}
            <MemberAddDrawer
              isOpen={isDrawerOpen}
              setIsOpen={setIsDrawerOpen}
              onMembersSelect={handleMembersSelect}
              selectedMembers={selectedMembers}
            />
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">책 정보를 찾을 수 없습니다.</p>
            <Link href="/mylibrary" className="text-[#215B32] font-medium mt-4 inline-block">
              내 서재로 돌아가기
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

const DetailMyLibrary = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#215B32]"></div>
        </div>
      }
    >
      <DetailMyLibraryContent />
    </Suspense>
  );
};

export default DetailMyLibrary;
