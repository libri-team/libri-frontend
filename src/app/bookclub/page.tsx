'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import ClubCard from '@/components/ui/ClubCard';

// Mock data for book clubs (replace with API call later)
const mockClubs = [
  {
    id: 1,
    name: '책읽는 사람들',
    description: '다양한 장르의 책을 함께 읽고 토론하는 모임입니다.',
    memberCount: 8,
  },
  {
    id: 2,
    name: '소설 마니아',
    description: '소설을 좋아하는 사람들의 모임입니다. 매주 한 권의 소설을 읽고 이야기를 나눕니다.',
    memberCount: 12,
  },
  {
    id: 3,
    name: '철학 독서회',
    description: '철학 서적을 함께 읽고 토론하는 모임입니다.',
    memberCount: 6,
  },
  {
    id: 4,
    name: '시 읽는 밤',
    description: '시를 좋아하는 사람들이 모여 시를 읽고 감상을 나누는 모임입니다.',
    memberCount: 5,
  },
];

export default function BookClubPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState(mockClubs);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">독서 모임</h1>
          <Link 
            href="/addbookclub" 
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md transition-colors"
          >
            <PlusCircle size={20} />
            <span>새 모임 만들기</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : clubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <ClubCard
                key={club.id}
                id={club.id}
                name={club.name}
                description={club.description}
                memberCount={club.memberCount}
                onClick={() => router.push(`/club/${club.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-gray-600 mb-4">아직 참여 중인 독서 모임이 없습니다.</p>
            <Link 
              href="/addbookclub" 
              className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md transition-colors"
            >
              <PlusCircle size={20} />
              <span>새 모임 만들기</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
} 