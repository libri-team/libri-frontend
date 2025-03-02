'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Users } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { clubService } from '@/lib/services/clubService';
import { memberService } from '@/lib/services/memberService';
import { Member, ClubRule, CreateClubRequest } from '@/lib/services/clubService';

export default function AddBookClubPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [rules, setRules] = useState<ClubRule[]>([
    { dateCount: 1, ruleStatus: 'WEEK', bookCount: 1, rule: '일주일에 1권 읽기' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Search for members
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      const members = await memberService.getMembers(searchTerm);
      setSearchResults(members);
    } catch (err) {
      console.error('Failed to search members:', err);
      setError('회원 검색에 실패했습니다.');
    }
  };

  // Add member to selected list
  const addMember = (member: Member) => {
    if (!selectedMembers.some(m => m.id === member.id)) {
      setSelectedMembers([...selectedMembers, member]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  // Remove member from selected list
  const removeMember = (memberId: number) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== memberId));
  };

  // Add a new rule
  const addRule = () => {
    setRules([
      ...rules,
      { dateCount: 1, ruleStatus: 'WEEK', bookCount: 1, rule: '' },
    ]);
  };

  // Update a rule
  const updateRule = (index: number, field: keyof ClubRule, value: string | number) => {
    const updatedRules = [...rules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setRules(updatedRules);
  };

  // Remove a rule
  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  // Create the book club
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('모임 이름을 입력해주세요.');
      return;
    }
    
    if (selectedMembers.length === 0) {
      setError('최소 한 명 이상의 회원을 추가해주세요.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const clubData: CreateClubRequest = {
        name,
        description,
        members: selectedMembers,
        rules,
      };
      
      await clubService.createClub(clubData);
      router.push('/bookclub');
    } catch (err) {
      console.error('Failed to create book club:', err);
      setError('독서 모임 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">새 독서 모임 만들기</h1>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                모임 이름
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="모임 이름을 입력하세요"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                모임 설명
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="모임에 대한 설명을 입력하세요"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                회원 추가
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="닉네임 또는 ID로 검색"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
                >
                  검색
                </button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="mb-4 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                  {searchResults.map((member) => (
                    <div
                      key={member.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                      onClick={() => addMember(member)}
                    >
                      <span>{member.nickname} ({member.uniqueId})</span>
                      <Plus size={16} className="text-green-700" />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full"
                  >
                    <span>{member.nickname}</span>
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="text-green-800 hover:text-green-900"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  모임 규칙
                </label>
                <button
                  type="button"
                  onClick={addRule}
                  className="text-sm text-green-700 hover:text-green-800 flex items-center gap-1"
                >
                  <Plus size={16} />
                  규칙 추가
                </button>
              </div>
              
              {rules.map((rule, index) => (
                <div key={index} className="flex gap-2 mb-2 items-start">
                  <div className="flex-1 flex flex-col sm:flex-row gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={rule.dateCount}
                        onChange={(e) => updateRule(index, 'dateCount', parseInt(e.target.value))}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                      />
                      <select
                        value={rule.ruleStatus}
                        onChange={(e) => updateRule(index, 'ruleStatus', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded-md"
                      >
                        <option value="DAY">일</option>
                        <option value="WEEK">주</option>
                        <option value="MONTH">월</option>
                      </select>
                      <span>마다</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={rule.bookCount}
                        onChange={(e) => updateRule(index, 'bookCount', parseInt(e.target.value))}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                      />
                      <span>권</span>
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    value={rule.rule}
                    onChange={(e) => updateRule(index, 'rule', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
                    placeholder="규칙 설명 (선택사항)"
                  />
                  
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="text-red-500 hover:text-red-700"
                    disabled={rules.length === 1}
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 flex items-center gap-2"
              >
                {isLoading ? '생성 중...' : (
                  <>
                    <Users size={18} />
                    모임 생성하기
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
