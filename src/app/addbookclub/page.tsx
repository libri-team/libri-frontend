'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CirclePlus, Search, CalendarIcon, X, Image as ImageIcon } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// 프로필 이미지 업로더 컴포넌트
const ProfileImageUploader = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 수정 및 업로드 버튼 클릭 시 파일 선택 다이얼로그 열기
  const handleUploadClick = () => {
    // 파일 입력 요소 초기화 (같은 파일 재선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // 파일 선택 다이얼로그 열기
    fileInputRef.current?.click();
  };

  // 파일 선택 시 처리
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return; // 파일 선택 취소 시 처리

    if (file.type === 'image/png' || file.type === 'image/jpeg') {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage(e.target.result as string);
          console.log('이미지가 로드되었습니다.'); // 디버깅용
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('PNG 또는 JPG 파일만 업로드 가능합니다.');
    }
  };

  // 호버 상태 관리
  const handleMouseEnter = () => {
    if (image) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // 이미지 삭제
  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="flex w-[36.375rem] h-[27.5rem] bg-[#F5F5F5] border-2 border-dashed border-[#A3A3A3] rounded-2xl relative overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {image ? (
        <>
          {/* 이미지 표시 영역 */}
          <div className="w-full h-full relative">
            <img
              src={image}
              alt="프로필 이미지"
              className={`w-full h-full object-cover transition-all duration-300 ${isHovering ? 'brightness-[0.6]' : ''}`}
            />

            {/* 호버 시 나타나는 버튼들 */}
            {isHovering && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                {/* 수정 버튼 */}
                <button
                  onClick={handleUploadClick}
                  className="bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-md hover:bg-gray-50"
                  aria-label="이미지 수정"
                  type="button"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 11.5V14H4.5L11.8733 6.62667L9.37333 4.12667L2 11.5ZM13.8067 4.69333C14.0667 4.43333 14.0667 4.01333 13.8067 3.75333L12.2467 2.19333C11.9867 1.93333 11.5667 1.93333 11.3067 2.19333L10.0867 3.41333L12.5867 5.91333L13.8067 4.69333Z"
                      fill="#6B7280"
                    />
                  </svg>
                  <span>수정하기</span>
                </button>

                {/* 삭제 버튼 */}
                <button
                  onClick={handleRemoveImage}
                  className="bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-md hover:bg-gray-50"
                  aria-label="이미지 삭제"
                  type="button"
                >
                  <X className="w-4 h-4 text-gray-500" />
                  <span>삭제하기</span>
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full p-6">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>

          <h3 className="text-lg font-medium text-gray-700 mb-2">프로필 사진을 업로드해주세요</h3>
          <p className="text-sm text-gray-500 mb-6 text-center">
            PNG, JPG 형식의 이미지 파일만 가능합니다.
          </p>

          <Button
            onClick={handleUploadClick}
            variant="outline"
            className="flex bg-white items-center justify-center w-[10rem] px-[0.75rem] py-[0.375rem] text-green-900 border-2 rounded border-[#215B32] hover:bg-green-50"
          >
            <div className="flex items-center gap-2">
              <span className="flex-grow text-center text-base">프로필 사진 넣기 </span>
              <CirclePlus className="w-5 h-5" />
            </div>
          </Button>
        </div>
      )}

      {/* 파일 입력 요소는 항상 DOM에 존재하도록 컴포넌트 최하단에 배치 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".png,.jpg,.jpeg"
        className="hidden"
        id="profile-image-input"
      />
    </div>
  );
};
interface MemberAddDrawerProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

// 더미 사용자 데이터 타입
interface User {
  id: string;
  username: string;
  profileImage: string;
}

// 더미 사용자 데이터
const DUMMY_USERS: User[] = [
  { id: 'user1', username: '김독서', profileImage: '/profile1.jpg' },
  { id: 'user2', username: '박책벌레', profileImage: '/profile2.jpg' },
  { id: 'user3', username: '이문학', profileImage: '/profile3.jpg' },
  { id: 'user4', username: '최작가', profileImage: '/profile4.jpg' },
  { id: 'user5', username: '정소설', profileImage: '/profile5.jpg' },
  { id: 'user6', username: '윤시인', profileImage: '/profile6.jpg' },
  { id: 'user7', username: '장르터', profileImage: '/profile7.jpg' },
  { id: 'user8', username: '강문장', profileImage: '/profile8.jpg' },
  { id: 'user9', username: '오페이지', profileImage: '/profile9.jpg' },
];

const MemberAddDrawer: React.FC<MemberAddDrawerProps> = ({ isOpen, setIsOpen }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // 검색 핸들러
  const handleSearch = () => {
    const trimmedTerm = searchTerm.trim().toLowerCase();

    if (!trimmedTerm) {
      setSearchResults([]);
      return;
    }

    const results = DUMMY_USERS.filter(
      (user) =>
        user.username.toLowerCase().includes(trimmedTerm) ||
        user.id.toLowerCase().includes(trimmedTerm),
    );

    setSearchResults(results);
  };

  // 엔터 키 검색 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 사용자 선택 핸들러
  const handleUserSelect = (user: User) => {
    if (!selectedUsers.some((selected) => selected.id === user.id)) {
      setSelectedUsers((prevSelected) => [...prevSelected, user]);
    }
  };

  // 선택된 사용자 제거 핸들러
  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prevSelected) => prevSelected.filter((user) => user.id !== userId));
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent className="flex items-center justify-center h-[65vh] rounded-t-2xl">
        <div className="flex w-48 mb-5 bg-[#F1F1F1] rounded-full p-[0.5rem] shrink-0 items-start gap-[0.625rem]"></div>
        <div className="mx-auto w-full h-full max-w-5xl px-6">
          <DrawerHeader className="text-left border-gray-200 pb-4">
            <DrawerTitle className="text-[1.375rem] font-semibold">같이 읽을 사람</DrawerTitle>
            <DrawerDescription className="text-base font-medium text-gray-400">
              Username 및 아이디로 검색해 보세요.
            </DrawerDescription>

            {/* 선택된 사용자 표시 */}
            {selectedUsers.length > 0 && (
              <div className="flex gap-2 mt-4">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center bg-gray-100 rounded-full px-2 py-1"
                  >
                    <span className="mr-2">{user.username}</span>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 검색 입력창 */}
            <div className="relative flex w-full h-10 py-3 bg-[#F5F5F5] items-center rounded-2xl mt-4">
              <div className="flex pl-4 items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                placeholder="같이 읽을 사람 검색하기"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 border-none bg-transparent outline-none"
              />
              <Button onClick={handleSearch} variant="ghost" size="sm" className="mr-2">
                검색
              </Button>
            </div>
            <div className="border-t border-gray-200 my-6"></div>
          </DrawerHeader>

          {/* 검색 결과 또는 추천 */}
          <div>
            {searchTerm && searchResults.length === 0 ? (
              <>
                <p className="text-[#374151] text-[1.125rem] font-semibold mb-4">
                  검색 결과 {searchResults.length}건
                </p>
                <p className="text-center text-gray-500">
                  `{searchTerm}`에 대한 검색 결과가 없습니다.
                </p>
              </>
            ) : searchTerm ? (
              <>
                <p className="text-[#374151] text-[1.125rem] font-semibold mb-4">
                  검색 결과 {searchResults.length}건
                </p>
                <div className="grid grid-cols-9 gap-8">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col w-full items-center py-[0.62rem] cursor-pointer hover:bg-gray-50"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                        <Image
                          src={user.profileImage}
                          width={100}
                          height={100}
                          className="rounded-full object-cover"
                          alt={`${user.username} 프로필`}
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="mt-3 text-[1.125rem] font-medium text-[#232323]">
                          {user.username}
                        </div>
                        <p className="text-base font-medium text-[#A3A3A3]">{user.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-[#374151] text-[1.125rem] font-semibold mb-[1.06rem]">추천</p>
                <div className="grid grid-cols-9 gap-8">
                  {DUMMY_USERS.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col w-full items-center py-[0.62rem] cursor-pointer hover:bg-gray-50"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                        <Image
                          src={user.profileImage}
                          width={100}
                          height={100}
                          className="rounded-full object-cover"
                          alt={`${user.username} 프로필`}
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="mt-3 text-[1.125rem] font-medium text-[#232323]">
                          {user.username}
                        </div>
                        <p className="text-base font-medium text-[#A3A3A3]">{user.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <DrawerFooter className="border-t border-gray-200 pt-4">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                닫기
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
const NewBookPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();
  const [memo, setMemo] = useState(''); // 메모

  return (
    <div
      className={`min-h-screen w-full bg-[#eef0ed] min-w-sm relative transition-all duration-300 ease-in-out flex flex-col ${
        isOpen ? 'scale-[0.98] rounded-xl overflow-hidden' : 'scale-100'
      }`}
    >
      <Navigation isDrawerOpen={isOpen} />
      <div className="absolute top-48 left-0 right-0 z-0 flex justify-center">
        <h1 className="font-playfair text-[17.5rem] font-normal leading-[22.75rem] text-[#183C23] opacity-15 whitespace-nowrap">
          Book Club
        </h1>
      </div>

      <main className="relative z-10 pt-[11.75rem] flex flex-col flex-grow">
        <div className="relative text-center mb-[5.25rem]">
          <h2 className="text-[2.375rem] font-semibold text-gray-800">신규 모임 생성</h2>
          <p className="text-[1.125rem] text-[#737373]">
            같이 읽는 즐거움, 더 오래 기억되는 이야기
          </p>
        </div>

        <div className="flex-grow flex flex-col w-full items-center justify-center bg-white px-[22.69rem] pt-[3.5rem] pb-28">
          <div className="flex items-center mb-[5.88rem] gap-10">
            {/* 왼쪽 컨텐츠 - 업데이트된 프로필 이미지 업로더 */}
            <div>
              <h3 className="text-xl font-medium mb-4">프로필 사진</h3>
              <ProfileImageUploader />
              <MemberAddDrawer isOpen={isOpen} setIsOpen={setIsOpen} />
            </div>

            {/* 오른쪽 컨텐츠 */}
            <div className="flex flex-col justify-end w-[37.25rem] h-80 mt-auto">
              <div className="flex flex-col gap-6">
                <div>
                  <div className="flex w-[18rem] px-[0.25rem] py-[0.5rem] justify-between items-center text-lg font-medium">
                    모임명
                  </div>
                  <Input
                    placeholder="모임명"
                    className="flex h-12 px-4 py-0 items-center gap-2 self-stretch rounded-lg border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>

                <div className="flex w-full">
                  <div className="mr-5">
                    <div className="flex w-[18rem] px-[0.25rem] py-[0.5rem] justify-between items-center text-lg font-medium">
                      시작일
                    </div>
                    <div className="flex w-72 h-12 items-center border border-gray-200 rounded-lg">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'newbook'}
                            className={cn(
                              ' justify-start text-left font-normal',
                              !startDate && 'text-muted-foreground',
                            )}
                          >
                            <CalendarIcon />
                            {startDate ? (
                              format(startDate, 'yyyy.MM.dd')
                            ) : (
                              <span>YYYY.MM.DD 00:00</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 m-2">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <div className="flex w-[18rem] px-[0.25rem] py-[0.5rem] justify-between items-center text-lg font-medium">
                      마감일
                    </div>
                    <div className="flex w-72 h-12 items-center border border-gray-200 rounded-lg">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'newbook'}
                            className={cn(
                              ' justify-start text-left font-normal',
                              !endDate && 'text-muted-foreground',
                            )}
                          >
                            <CalendarIcon />
                            {endDate ? (
                              format(endDate, 'yyyy.MM.dd')
                            ) : (
                              <span>YYYY.MM.DD 00:00</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 m-2">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex w-[18rem] px-[0.25rem] py-[0.5rem] justify-between items-center text-lg font-medium">
                    맴버
                  </div>
                  <Button
                    onClick={() => setIsOpen(true)} // 드로어 열기
                    variant={'newbook'}
                    className="flex w-full h-12 px-4 py-0 justify-start items-center gap-2 self-stretch rounded-lg border border-[#D1D5DB] bg-white hover:bg-gray-50"
                  >
                    <CirclePlus className="w-6 h-6 text-[#A3A3A3]" />
                    <span className="text-base text-[#A3A3A3]">추가하기</span>
                  </Button>
                </div>
                <div>
                  <div className="flex w-[18rem] px-[0.25rem] py-[0.5rem] justify-between items-center text-lg font-medium">
                    메모
                  </div>
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="메모를 작성해 주세요."
                    className="flex w-full h-24 px-4 py-[0.875rem] flex-col items-start gap-0 self-stretch rounded-lg bg-[#F3F4F6] border-transparent resize-none focus:border-[#215B32] focus:ring-2 focus:ring-[#215B32] outline-none"
                    style={{
                      caretColor: '#215B32', // 커서 색상
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/*  아래 생성하기  */}
          <div className="flex justify-center items-center shrink-0 w-[18.5rem] h-16">
            <Button className="flex text-center w-full h-full px-4 py-2 rounded-[10rem] bg-[#215B32] hover:bg-green-700 text-white text-xl font-normal">
              생성하기
            </Button>
          </div>
        </div>
      </main>

      {/* Overlay for drawer */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
    </div>
  );
};

export default NewBookPage;
