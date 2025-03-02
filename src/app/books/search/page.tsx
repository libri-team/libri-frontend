'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import Navigation from '@/components/Navigation';
import BookCard from '@/components/ui/BookCard';
import { bookService } from '@/lib/services/bookService';
import { Book } from '@/lib/services/bookService';

export default function BookSearchPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    setError('');
    setPage(1);
    
    try {
      const response = await bookService.searchBooks(searchTerm, 1, 20);
      setSearchResults(response.books || []);
      setHasMore(response.books.length >= 20);
    } catch (err) {
      console.error('Failed to search books:', err);
      setError('책 검색에 실패했습니다.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    const nextPage = page + 1;
    
    try {
      const response = await bookService.searchBooks(searchTerm, nextPage, 20);
      setSearchResults(prev => [...prev, ...(response.books || [])]);
      setHasMore(response.books.length >= 20);
      setPage(nextPage);
    } catch (err) {
      console.error('Failed to load more books:', err);
      setError('추가 책 로딩에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setError('');
  };
  
  const handleBookClick = (isbn: string) => {
    router.push(`/books/${isbn}`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">책 검색</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={18} className="text-gray-500" />
                </div>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <X size={18} className="text-gray-500 hover:text-gray-700" />
                  </button>
                )}
                <input
                  type="text"
                  placeholder="책 제목, 저자, 출판사, ISBN 등으로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !searchTerm.trim()}
                className="px-6 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                검색
              </button>
            </form>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {searchResults.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {searchResults.map((book) => (
                  <BookCard
                    key={book.isbn}
                    book={book}
                    onClick={() => handleBookClick(book.isbn)}
                  />
                ))}
              </div>
              
              {hasMore && (
                <div className="flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="px-6 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {isLoading ? '로딩 중...' : '더 보기'}
                  </button>
                </div>
              )}
            </>
          ) : searchTerm && !isLoading ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">검색 결과가 없습니다</h2>
              <p className="text-gray-600">다른 검색어를 사용해보세요</p>
            </div>
          ) : null}
          
          {isLoading && (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 