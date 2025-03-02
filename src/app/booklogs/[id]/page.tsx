'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, Calendar, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { booklogService } from '@/lib/services/booklogService';
import { BookLogDetail, BookReadingStatus } from '@/lib/services/booklogService';
import { authService } from '@/lib/services/authService';
import { showAlert } from '@/components/ui/alert';

const statusLabels: Record<BookReadingStatus, string> = {
  'WANT_TO_READ': '읽고 싶은 책',
  'READING': '읽는 중',
  'COMPLETED': '읽기 완료',
  'ABANDONED': '일시 중단',
  'GAVE_UP': '읽기 포기'
};

export default function BookLogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [bookLog, setBookLog] = useState<BookLogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      showAlert('로그인이 필요합니다. 로그인 페이지로 이동합니다.', 'warning');
      router.push('/');
      return;
    }
    
    const fetchBookLogDetail = async () => {
      try {
        const detail = await booklogService.getBookLogById(id);
        setBookLog(detail);
      } catch (err) {
        console.error('Failed to fetch book log details:', err);
        setError('책 기록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookLogDetail();
  }, [id, router]);
  
  const handleEdit = () => {
    router.push(`/booklogs/edit/${id}`);
  };
  
  const handleDelete = async () => {
    if (!confirm('정말로 이 책 기록을 삭제하시겠습니까?')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Note: This is a placeholder for the actual delete API call
      // await booklogService.deleteBookLog(id);
      alert('책 기록이 삭제되었습니다.');
      router.push('/mylibrary');
    } catch (err) {
      console.error('Failed to delete book log:', err);
      setError('책 기록 삭제에 실패했습니다.');
      setIsDeleting(false);
    }
  };
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '날짜 없음';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
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
  
  if (error || !bookLog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-24">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">오류가 발생했습니다</h1>
            <p className="text-gray-600 mb-6">{error || '책 기록을 불러올 수 없습니다.'}</p>
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
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={18} />
            <span>뒤로 가기</span>
          </button>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Book Cover */}
                <div className="flex-shrink-0 w-full md:w-48">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-md shadow-md">
                    <Image
                      src={bookLog.thumbnail || '/placeholder-book.png'}
                      alt={bookLog.title}
                      fill
                      className="object-cover"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </div>
                
                {/* Book Info */}
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{bookLog.title}</h1>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleEdit}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-gray-600">{bookLog.authors}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-600">{bookLog.publisher}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-50 p-2 rounded-full">
                        <Star className="h-5 w-5 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">평점</p>
                        <p className="font-medium">
                          {bookLog.rating > 0 ? `${bookLog.rating}.0` : '평점 없음'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="bg-green-50 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">상태</p>
                        <p className="font-medium">{statusLabels[bookLog.status]}</p>
                      </div>
                    </div>
                    
                    {bookLog.startDateTime && (
                      <div className="flex items-center gap-2">
                        <div className="bg-green-50 p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-green-700" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">시작일</p>
                          <p className="font-medium">{formatDate(bookLog.startDateTime)}</p>
                        </div>
                      </div>
                    )}
                    
                    {bookLog.endDateTime && (
                      <div className="flex items-center gap-2">
                        <div className="bg-green-50 p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-green-700" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">완료일</p>
                          <p className="font-medium">{formatDate(bookLog.endDateTime)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {bookLog.description && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">책 소개</h2>
                  <p className="text-gray-700 whitespace-pre-line">{bookLog.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 