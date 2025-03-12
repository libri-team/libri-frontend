'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { User } from './types';
import { fetchMembersFromAPI } from './api';

interface MemberAddDrawerProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onMembersSelect: (members: User[]) => void;
  selectedMembers: User[];
}

// 안전한 문자열 확인 함수
const isValidString = (str: unknown): boolean => {
  return typeof str === 'string' && str !== null && str !== undefined;
};

const MemberAddDrawer: React.FC<MemberAddDrawerProps> = ({
  isOpen,
  setIsOpen,
  onMembersSelect,
  selectedMembers,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [apiUsers, setApiUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch member list from API for initial recommendations
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const users = await fetchMembersFromAPI();
        setApiUsers(users);
      } catch (err) {
        setError('회원 정보를 불러오는데 실패했습니다.');
        console.error('회원 정보 가져오기 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // API search function
  const searchMembersFromAPI = async (query: string): Promise<User[]> => {
    if (!query.trim()) return [];

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('인증 정보가 없습니다. 다시 로그인해주세요.');
    }

    const response = await fetch(
      `https://dev-api.libri.kr/member/members?search_req=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`검색 중 오류가 발생했습니다: ${response.status}`);
    }

    const data = await response.json();
    // 유효한 데이터만 필터링 (null, undefined, 빈 문자열 제외)
    return data.filter(
      (user: User) =>
        isValidString(user.uniqueId) &&
        isValidString(user.nickname) &&
        user.uniqueId.trim() !== '' &&
        user.nickname.trim() !== '',
    );
  };

  // Search handler
  const handleSearch = async (): Promise<void> => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await searchMembersFromAPI(searchTerm);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.');
      console.error('멤버 검색 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Enter key search handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // User selection handler
  const handleUserSelect = (user: User): void => {
    if (!selectedMembers.some((selected) => selected.id === user.id)) {
      const updatedMembers = [...selectedMembers, user];
      onMembersSelect(updatedMembers);
    }
  };

  // Selected user removal handler
  const handleRemoveUser = (userId: number): void => {
    const updatedMembers = selectedMembers.filter((user) => user.id !== userId);
    onMembersSelect(updatedMembers);
  };

  // 유효성 검사가 포함된 필터 함수
  const isValidUser = (user: User): boolean => {
    return (
      user &&
      isValidString(user.uniqueId) &&
      isValidString(user.nickname) &&
      user.uniqueId.trim() !== '' &&
      user.nickname.trim() !== ''
    );
  };

  // 결과를 안전하게 필터링
  const filteredApiUsers = apiUsers.filter(isValidUser);

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

            {/* Display selected users */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedMembers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center bg-gray-100 rounded-full px-2 py-1"
                  >
                    <span className="mr-2">{user.nickname}</span>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-gray-500 hover:text-gray-700"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Search input */}
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
              <Button
                onClick={handleSearch}
                variant="ghost"
                size="sm"
                className="mr-2"
                disabled={isLoading || !searchTerm.trim()}
              >
                {isLoading ? '검색 중...' : '검색'}
              </Button>
            </div>
            <div className="border-t border-gray-200 my-6"></div>
          </DrawerHeader>

          {/* Search results or recommendations */}
          <div className="overflow-y-auto" style={{ height: '500px' }}>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#215B32]"></div>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500">{error}</p>
              </div>
            ) : searchTerm && searchResults.length === 0 ? (
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
                <div className="grid" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col w-full items-center py-[0.62rem] cursor-pointer hover:bg-gray-50"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-lg font-semibold text-white">
                          {user.nickname && user.nickname.charAt(0)}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="mt-3 text-[1.125rem] font-medium text-[#232323]">
                          {user.nickname}
                        </div>
                        <p className="text-base font-medium text-[#A3A3A3]">{user.uniqueId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-[#374151] text-[1.125rem] font-semibold mb-[1.06rem]">
                  {filteredApiUsers.length > 0 ? '추천' : '회원 목록'}
                </p>
                {filteredApiUsers.length > 0 ? (
                  <div
                    className="grid"
                    style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
                  >
                    {filteredApiUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex flex-col w-full items-center py-[0.62rem] cursor-pointer hover:bg-gray-50"
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-lg font-semibold text-white">
                            {user.nickname && user.nickname.charAt(0)}
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="mt-3 text-[1.125rem] font-medium text-[#232323]">
                            {user.nickname}
                          </div>
                          <p className="text-base font-medium text-[#A3A3A3]">{user.uniqueId}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-5">회원 정보가 없습니다.</p>
                )}
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

export default MemberAddDrawer;
