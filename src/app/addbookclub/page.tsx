'use client';

import React, { useState, useEffect } from 'react';
import { CirclePlus, Minus, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navigation from '@/components/Navigation';
import MemberAddDrawer from '@/components/bookclub/MemberAddDrawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface User {
  id: number;
  uniqueId: string;
  nickname: string;
}

interface Rule {
  dateCount: number;
  ruleStatus: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  bookCount: number;
  rule: string;
}

interface ClubData {
  name: string;
  members: {
    id: number;
    uniqueId: string;
    nickname: string;
  }[];
  rules: Rule[];
  description: string;
  fileUrl?: string | null;
}

const NewBookClubPage = () => {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [clubName, setClubName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPageOpen] = useState<boolean>(false);
  const [, setConsoleOutput] = useState<string>('');

  // 규칙 관련 상태
  const [rules, setRules] = useState<Rule[]>([
    {
      dateCount: 1,
      ruleStatus: 'DAY',
      bookCount: 1,
      rule: '',
    },
  ]);

  // 로그 출력 기록 함수
  const logToConsole = (message: string) => {
    setConsoleOutput((prev) => `${prev}\n${message}`);
    console.log(message);
  };

  // 페이지 로드 시 로그 초기화
  useEffect(() => {
    setConsoleOutput('콘솔 로그:');
  }, []);

  // 규칙 업데이트 핸들러
  const handleRuleChange = (index: number, field: keyof Rule, value: any) => {
    const updatedRules = [...rules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setRules(updatedRules);
  };

  // 규칙 추가 핸들러
  const addRule = () => {
    setRules([
      ...rules,
      {
        dateCount: 1,
        ruleStatus: 'DAY',
        bookCount: 1,
        rule: '규칙을 적어주세요',
      },
    ]);
  };

  // 규칙 제거 핸들러
  const removeRule = (index: number) => {
    if (rules.length > 1) {
      const updatedRules = [...rules];
      updatedRules.splice(index, 1);
      setRules(updatedRules);
    }
  };

  // ruleStatus에 따른 텍스트 반환
  const getRuleStatusText = (status: string) => {
    switch (status) {
      case 'DAY':
        return '일';
      case 'WEEK':
        return '주';
      case 'MONTH':
        return '월';
      case 'YEAR':
        return '년';
      default:
        return '일';
    }
  };

  // 모임 생성 핸들러
  const handleCreateClub = async (): Promise<void> => {
    // 필수 필드 확인
    if (!clubName.trim()) {
      alert('모임 이름을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // API 요청 데이터 구성
    const clubData: ClubData = {
      name: clubName,
      members: selectedMembers.map((member) => ({
        id: member.id,
        uniqueId: member.uniqueId,
        nickname: member.nickname,
      })),
      rules: rules,
      description: description,
      fileUrl: null,
    };

    logToConsole('전송 데이터: ' + JSON.stringify(clubData, null, 2));

    try {
      const token = localStorage.getItem('accessToken');
      // POST 요청
      const response = await fetch('https://dev-api.libri.kr/club', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify(clubData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `서버 오류: ${response.status}`);
      }

      alert('모임이 성공적으로 생성되었습니다.');
      router.push('/bookclub'); // 모임 목록 페이지로 이동
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '모임 생성에 실패했습니다. 다시 시도해주세요.';
      logToConsole('모임 생성 실패: ' + errorMessage);
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full bg-[#eef0ed] min-w-sm relative transition-all duration-300 ease-in-out flex flex-col ${
        isPageOpen ? 'scale-[0.98] rounded-xl overflow-hidden' : 'scale-100'
      }`}
    >
      <Navigation isDrawerOpen={isPageOpen} />
      <div className="absolute top-48 left-0 right-0 z-0 flex justify-center">
        <h1 className="font-playfair text-[17.5rem] font-normal leading-[22.75rem] text-[#183C23] opacity-15 whitespace-nowrap">
          Book Club
        </h1>
      </div>

      <main className="relative z-10 pt-[11.75rem] flex flex-col flex-grow">
        <div className="relative text-center mb-[5.25rem]">
          <h2 className="text-[2.375rem] font-semibold text-gray-800">신규 모임 생성</h2>
          <p className="text-[1.125rem] text-[#737373]">모임 정보를 입력해주세요</p>
        </div>

        <div className="flex-grow flex flex-col w-full items-center justify-center bg-white px-20 pt-[3.5rem] pb-28">
          <div className="w-full max-w-xl">
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex px-[0.25rem] py-[0.5rem] justify-between items-center text-lg font-medium">
                  모임명
                </div>
                <Input
                  placeholder="모임명"
                  className="flex h-12 px-4 py-0 items-center gap-2 self-stretch rounded-lg border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                />
              </div>

              <div>
                <div className="flex px-[0.25rem] py-[0.5rem] justify-between items-center text-lg font-medium">
                  맴버
                </div>
                <Button
                  onClick={() => setIsDrawerOpen(true)}
                  variant={'outline'}
                  className="flex w-full h-12 px-4 py-0 justify-start items-center gap-2 self-stretch rounded-lg border border-[#D1D5DB] bg-white hover:bg-gray-50"
                >
                  <CirclePlus className="w-6 h-6 text-[#A3A3A3]" />
                  <span className="text-base text-[#A3A3A3]">
                    {selectedMembers.length > 0 ? `${selectedMembers.length}명 선택됨` : '추가하기'}
                  </span>
                </Button>

                {/* 선택된 멤버 표시 */}
                {selectedMembers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                      >
                        <span>{member.nickname}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 목표 섹션 */}
              <div>
                <div className="flex px-[0.25rem] py-[0.5rem] justify-between items-center text-lg font-medium">
                  목표
                </div>

                {rules.map((rule, index) => (
                  <div
                    key={index}
                    className="mb-4 rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="bg-[#EFF6F0] px-4 py-3 flex justify-between  border-b border-gray-200">
                      <div className="text-[#215B32] font-medium flex items-center">
                        <span className="flex items-center justify-center bg-[#215B32] text-white rounded-full w-6 h-6 text-sm mr-2">
                          {index + 1}
                        </span>
                        목표 설정
                      </div>
                      <button
                        onClick={() => removeRule(index)}
                        disabled={rules.length <= 1}
                        className={`p-1.5 rounded-full transition-colors ${
                          rules.length <= 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-[#D7E6DB]'
                        }`}
                        aria-label="목표 삭제"
                      >
                        <Minus size={20} />
                      </button>
                    </div>

                    <div className="p-4 bg-white">
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">독서 목표</label>
                        <div className="flex flex-wrap items-center gap-2 bg-[#F9FAFB] p-3 rounded-lg">
                          <Input
                            type="number"
                            min="1"
                            value={rule.dateCount}
                            onChange={(e) =>
                              handleRuleChange(index, 'dateCount', parseInt(e.target.value) || 1)
                            }
                            className="w-16 text-center border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                            placeholder="1"
                          />

                          <Select
                            value={rule.ruleStatus}
                            onValueChange={(value) => handleRuleChange(index, 'ruleStatus', value)}
                          >
                            <SelectTrigger className="w-20 border-gray-200 bg-white focus:ring-green-500 focus:border-green-500">
                              <SelectValue>{getRuleStatusText(rule.ruleStatus)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-white rounded-md shadow-lg border border-gray-200">
                              <SelectItem
                                value="DAY"
                                className="py-1.5 px-4 hover:bg-gray-50 cursor-pointer"
                              >
                                일
                              </SelectItem>
                              <SelectItem
                                value="WEEK"
                                className="py-1.5 px-4 hover:bg-gray-50 cursor-pointer"
                              >
                                주
                              </SelectItem>
                              <SelectItem
                                value="MONTH"
                                className="py-1.5 px-4 hover:bg-gray-50 cursor-pointer"
                              >
                                월
                              </SelectItem>
                              <SelectItem
                                value="YEAR"
                                className="py-1.5 px-4 hover:bg-gray-50 cursor-pointer"
                              >
                                년
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <span className="text-gray-700">마다</span>
                          <Input
                            type="number"
                            min="1"
                            value={rule.bookCount}
                            onChange={(e) =>
                              handleRuleChange(index, 'bookCount', parseInt(e.target.value) || 1)
                            }
                            className="w-16 text-center border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                            placeholder="1"
                          />

                          <span className="text-gray-700">권의 책을 읽습니다</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">추가 규칙</label>
                        <Input
                          value={rule.rule}
                          onChange={(e) => handleRuleChange(index, 'rule', e.target.value)}
                          className="w-full border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                          placeholder="예) 매주 일요일 저녁 8시에 온라인으로 모여 토론합니다"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="flex w-full justify-center items-center py-2.5 mt-2 border border-dashed border-[#215B32] text-[#215B32] hover:bg-green-50"
                  onClick={addRule}
                >
                  <Plus size={18} className="mr-2" /> 목표 추가하기
                </Button>
              </div>
              <div>
                <div className="flex px-[0.25rem] py-[0.5rem] justify-between items-center text-lg font-medium">
                  메모
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="메모를 작성해 주세요."
                  className="flex w-full h-24 px-4 py-[0.875rem] flex-col items-start gap-0 self-stretch rounded-lg bg-[#F3F4F6] border-transparent resize-none focus:border-[#215B32] focus:ring-2 focus:ring-[#215B32] outline-none"
                  style={{ caretColor: '#215B32' }}
                />
              </div>
            </div>

            {/* 오류 메시지 표시 */}
            {error && (
              <div className="w-full mt-6 p-3 bg-red-50 text-red-700 rounded-md">
                <p className="text-center">{error}</p>
              </div>
            )}

            {/* 생성하기 버튼 */}
            <div className="flex justify-center items-center mt-8 shrink-0 w-full">
              <Button
                className="flex justify-center items-center w-full max-w-[18.5rem] h-16 px-4 py-2 rounded-[10rem] bg-[#215B32] hover:bg-green-700 text-white text-xl font-normal disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCreateClub}
                disabled={isSubmitting}
              >
                {isSubmitting ? '생성 중...' : '생성하기'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* 드로어용 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 멤버 추가 드로어 */}
      <MemberAddDrawer
        isOpen={isDrawerOpen}
        setIsOpen={setIsDrawerOpen}
        onMembersSelect={setSelectedMembers}
        selectedMembers={selectedMembers}
      />
    </div>
  );
};

export default NewBookClubPage;
