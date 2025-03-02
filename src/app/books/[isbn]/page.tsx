'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Star, BookOpen, PlusCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { bookService } from '@/lib/services/bookService';
import { BookDetail } from '@/lib/services/bookService';
import { authService } from '@/lib/services/authService';
import { showAlert } from '@/components/ui/alert';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const isbn = params.isbn as string;
  
  const [book, setBook] = useState<BookDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    
    const fetchBookDetail = async () => {
      try {
        const bookDetail = await bookService.getBookDetail(isbn);
        setBook(bookDetail);
      } catch (err) {
        console.error('Failed to fetch book details:', err);
        setError('책 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookDetail();
  }, [isbn]);
  
  const handleAddToLibrary = () => {
    if (!isAuthenticated) {
      showAlert('로그인이 필요합니다. 로그인 페이지로 이동합니다.', 'warning');
      return;
    }
    
    router.push(`/booklogs/add?isbn=${isbn}`);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-24">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
          </div>
        </main>
      </div>
    );
  }
  
  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-24">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">오류가 발생했습니다</h1>
            <p className="text-gray-600 mb-6">{error || '책 정보를 불러올 수 없습니다.'}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
            >
              이전 페이지로 돌아가기
            </button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
            {/* Book Cover */}
            <div className="flex-shrink-0 w-full md:w-64 lg:w-80">
              <div className="relative aspect-[2/3] overflow-hidden rounded-md shadow-md">
                <Image
                  src={book.cover || '/placeholder-book.png'}
                  alt={book.title}
                  fill
                  className="object-cover"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              
              {isAuthenticated && (
                <button
                  onClick={handleAddToLibrary}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-3 rounded-md transition-colors"
                >
                  <PlusCircle size={20} />
                  <span>내 서재에 추가</span>
                </button>
              )}
            </div>
            
            {/* Book Details */}
            <div className="flex-grow">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-gray-600">{book.author}</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">{book.publisher}</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">{book.pubDate}</span>
              </div>
              
              <div className="flex items-center gap-1 mb-6">
                <Star className="text-yellow-500" size={20} />
                <span className="text-lg font-semibold">
                  {(book.priceSales / book.priceStandard * 5).toFixed(1)}
                </span>
                <span className="text-gray-500 text-sm ml-1">/ 5.0</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-gray-500" />
                  <span className="text-gray-700">출판일: {book.pubDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-gray-500" />
                  <span className="text-gray-700">ISBN: {book.isbn13}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-gray-500" />
                  <span className="text-gray-700">정가: {book.priceStandard.toLocaleString()}원</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-gray-500" />
                  <span className="text-gray-700">판매가: {book.priceSales.toLocaleString()}원</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">책 소개</h2>
                <p className="text-gray-700 whitespace-pre-line">{book.description}</p>
              </div>
              
              <div>
                <Link
                  href={book.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:text-green-900 hover:underline flex items-center gap-1"
                >
                  <span>알라딘에서 보기</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 