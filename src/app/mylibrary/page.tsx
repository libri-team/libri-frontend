'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Search, Star } from 'lucide-react';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import BookLogCard from '@/components/ui/BookLogCard';
import { booklogService } from '@/lib/services/booklogService';
import { BookReadingStatus, BookLogSummary } from '@/lib/services/booklogService';
import { authService } from '@/lib/services/authService';

export default function MyLibrary() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [books, setBooks] = useState<BookLogSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<BookReadingStatus | 'ALL'>('ALL');

  useEffect(() => {
    // 사용자 인증 확인
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    // 예시 데이터 로딩 (실제로는 API에서 가져옵니다)
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        // API 호출을 대체하는 임시 데이터
        setTimeout(() => {
          const mockBooks = [
            {
              id: '1',
              title: '사피엔스',
              author: '유발 하라리',
              coverUrl: 'https://via.placeholder.com/150x200?text=Sapiens',
              readingStatus: '읽는 중',
              rating: 4.5,
              startDate: '2024-01-15',
              endDate: null,
            },
            {
              id: '2',
              title: '1984',
              author: '조지 오웰',
              coverUrl: 'https://via.placeholder.com/150x200?text=1984',
              readingStatus: '완독',
              rating: 5,
              startDate: '2023-12-01',
              endDate: '2023-12-20',
            },
            {
              id: '3',
              title: '어린 왕자',
              author: '앙투안 드 생텍쥐페리',
              coverUrl: 'https://via.placeholder.com/150x200?text=Little+Prince',
              readingStatus: '읽을 예정',
              rating: 0,
              startDate: null,
              endDate: null,
            },
            {
              id: '4',
              title: '데미안',
              author: '헤르만 헤세',
              coverUrl: 'https://via.placeholder.com/150x200?text=Demian',
              readingStatus: '완독',
              rating: 4,
              startDate: '2023-11-10',
              endDate: '2023-11-25',
            },
            {
              id: '5',
              title: '파리의 아파트',
              author: '기욤 뮈소',
              coverUrl: 'https://via.placeholder.com/150x200?text=Paris+Apartment',
              readingStatus: '읽는 중',
              rating: 3.5,
              startDate: '2024-02-10',
              endDate: null,
            },
          ];
          setBooks(mockBooks);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('책 데이터를 로드하는 중 오류가 발생했습니다:', error);
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [router, status]);

  const handleBookClick = (id) => {
    router.push(`/booklogs/${id}`);
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'ALL') return matchesSearch;
    return matchesSearch && book.readingStatus === filterStatus;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen pb-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">내 서재</h1>
        <p className="text-gray-600">나만의 독서 여정을 기록하고 관리하세요.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-grow">
          <div className="relative">
            <input
              type="text"
              placeholder="책 제목 또는 저자 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
        
        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as BookReadingStatus | 'ALL')}
            className="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            <option value="ALL">전체 상태</option>
            <option value="WANT_TO_READ">읽고 싶은 책</option>
            <option value="READING">읽는 중</option>
            <option value="COMPLETED">읽기 완료</option>
            <option value="ABANDONED">일시 중단</option>
            <option value="GAVE_UP">읽기 포기</option>
          </select>
          
          <button
            onClick={() => router.push('/books/search')}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            책 추가하기
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <div className="flex justify-center mb-4">
            <BookOpen className="text-gray-400" size={48} />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">아직 책이 없습니다</h3>
          <p className="text-gray-500 mb-6">책을 검색하고 내 서재에 추가해보세요.</p>
          <button
            onClick={() => router.push('/books/search')}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <Search size={18} />
            책 검색하기
          </button>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredBooks.map((book) => (
            <motion.div
              key={book.id}
              variants={item}
              className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleBookClick(book.id)}
            >
              <div className="relative pt-[140%]">
                <Image
                  src={book.coverUrl}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${book.readingStatus === 'READING' ? 'bg-blue-100 text-blue-800' : 
                      book.readingStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'}
                  `}>
                    {book.readingStatus}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{book.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                {book.rating > 0 && (
                  <div className="flex items-center">
                    <Star className="text-yellow-500 fill-yellow-500" size={14} />
                    <span className="text-sm ml-1 text-gray-700">{book.rating}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
