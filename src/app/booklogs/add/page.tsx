'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Star } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { bookService } from '@/lib/services/bookService';
import { booklogService } from '@/lib/services/booklogService';
import { BookDetail } from '@/lib/services/bookService';
import { BookReadingStatus, CreateBookLogRequest } from '@/lib/services/booklogService';
import { authService } from '@/lib/services/authService';
import { showAlert } from '@/components/ui/alert';

export default function AddBookLogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isbn = searchParams.get('isbn');
  
  const [book, setBook] = useState<BookDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<BookReadingStatus>('WANT_TO_READ');
  const [rating, setRating] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      showAlert('로그인이 필요합니다. 로그인 페이지로 이동합니다.', 'warning');
      router.push('/');
      return;
    }
    
    // Fetch book details if ISBN is provided
    if (isbn) {
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
    } else {
      setIsLoading(false);
      setError('ISBN이 제공되지 않았습니다.');
    }
  }, [isbn, router]);
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as BookReadingStatus);
  };
  
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };
  
  const formatDateForApi = (dateString: string) => {
    if (!dateString) return '';
    return dateString.replace(/-/g, '-') + ' 00:00:00';
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!book) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const bookLogData: CreateBookLogRequest = {
        isbn: book.isbn13,
        title: book.title,
        description: book.description,
        authors: book.author,
        publisher: book.publisher,
        thumbnail: book.cover,
        link: book.link,
        rating,
        status,
        startDateTime: formatDateForApi(startDate),
        endDateTime: formatDateForApi(endDate),
      };
      
      const response = await booklogService.createBookLog(bookLogData);
      
      if (response.id) {
        router.push('/mylibrary');
      } else {
        throw new Error('서재에 책을 추가하는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to add book to library:', err);
      setError('서재에 책을 추가하는데 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">내 서재에 책 추가하기</h1>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
                {error}
              </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              {/* Book Cover */}
              <div className="flex-shrink-0 w-full md:w-48">
                <div className="relative aspect-[2/3] overflow-hidden rounded-md shadow-md">
                  <Image
                    src={book.cover || '/placeholder-book.png'}
                    alt={book.title}
                    fill
                    className="object-cover"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
              
              {/* Book Info */}
              <div className="flex-grow">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{book.title}</h2>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-gray-600">{book.author}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">{book.publisher}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">{book.pubDate}</span>
                </div>
                
                <p className="text-gray-700 line-clamp-3 mb-4">{book.description}</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    읽기 상태
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={handleStatusChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="WANT_TO_READ">읽고 싶은 책</option>
                    <option value="READING">읽는 중</option>
                    <option value="COMPLETED">읽기 완료</option>
                    <option value="ABANDONED">일시 중단</option>
                    <option value="GAVE_UP">읽기 포기</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    평점
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={`${
                            star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-gray-700">{rating > 0 ? `${rating}.0` : '평점 없음'}</span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    시작일
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar size={18} className="text-gray-500" />
                    </div>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    완료일
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar size={18} className="text-gray-500" />
                    </div>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
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
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
                >
                  {isSubmitting ? '추가 중...' : '내 서재에 추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 