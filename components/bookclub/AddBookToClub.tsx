'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, set } from 'date-fns';
import { useRouter } from 'next/navigation';
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
import { CalendarIcon, CirclePlus, Plus, Search, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// 책 데이터 타입 정의
interface Book {
  title: string;
  author: string;
  publisher: string;
  cover?: string;
  isbn?: string;
  isbn13?: string;
  pubDate?: string;
  description?: string;
  link?: string;
}

// API로부터 받는 책 데이터 타입
interface ApiBook {
  title: string;
  authors: string[];
  thumbnail: string;
  publisher: string;
  pubDate: string;
  isbn: string;
  link?: string;
}

interface BookSearchDrawerProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onAddBook?: (book: Book) => void;
}

interface BookDetailCardProps {
  book: Book;
  onClose: () => void;
}

// BookSearchDrawer 컴포넌트
const BookSearchDrawer: React.FC<BookSearchDrawerProps> = ({ isOpen, setIsOpen, onAddBook }) => {
  const [hoveredBookIndex, setHoveredBookIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [bestsellers, setBestsellers] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsBestsellerLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // 베스트셀러 불러오기 함수
  const fetchBestsellers = async () => {
    setIsBestsellerLoading(true);
    try {
      const token = localStorage.getItem('accessToken');

      const response = await axios.get('https://dev-api.libri.kr/api/aladin/bestsellers', {
        params: {
          page: 0,
          size: 50,
        },
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      if (data && Array.isArray(data.books)) {
        const formattedBooks: Book[] = data.books.map((book: ApiBook) => ({
          title: book.title,
          author: book.authors ? book.authors.join(', ') : '',
          publisher: book.publisher || '',
          cover: book.thumbnail,
          pubDate: book.pubDate,
          isbn: book.isbn,
          link: book.link || '',
        }));

        setBestsellers(formattedBooks);
      } else {
        setBestsellers([]);
      }
    } catch (err) {
      console.error('베스트셀러 조회 오류:', err);
      setBestsellers([]);
    } finally {
      setIsBestsellerLoading(false);
    }
  };

  // 검색 함수
  const searchBooks = async (keyword: string, page: number = 1) => {
    if (!keyword.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');

      const response = await axios.get('https://dev-api.libri.kr/api/aladin/search', {
        params: {
          keyword: keyword.trim(),
          page: page - 1,
          size: pageSize,
        },
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      if (data && Array.isArray(data.books)) {
        setTotalCount(data.totalCount || 0);
        setTotalPages(Math.ceil((data.totalCount || 0) / pageSize));

        const formattedBooks: Book[] = data.books.map((book: ApiBook) => ({
          title: book.title,
          author: book.authors ? book.authors.join(', ') : '',
          publisher: book.publisher || '',
          cover: book.thumbnail,
          pubDate: book.pubDate,
          isbn: book.isbn,
          link: book.link || '',
        }));

        setSearchResults(formattedBooks);
      } else {
        setSearchResults([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('도서 검색 오류:', err);
      setError('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색어 변경 시 검색 실행
  const handleSearch = () => {
    setCurrentPage(1);
    searchBooks(searchTerm, 1);
  };

  // 엔터 키 입력 시 검색 실행
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 페이지 변경 처리
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      searchBooks(searchTerm, newPage);
    }
  };

  // 컴포넌트 마운트 시 베스트셀러 불러오기
  useEffect(() => {
    if (!searchTerm.trim()) {
      fetchBestsellers();
    }
  }, []);

  // 검색어 변경 시 베스트셀러 또는 검색 결과 처리
  useEffect(() => {
    if (!searchTerm.trim()) {
      fetchBestsellers();
    }
  }, [searchTerm]);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger className="hidden" />
      <DrawerContent className="flex items-center justify-center rounded-2xl h-[90vh]">
        <div className="mx-auto w-full h-full max-w-5xl">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-[1.375rem] font-semibold">책 정보 검색</DrawerTitle>
            <DrawerDescription className="text-base font-medium text-gray-400">
              제목, 저자, 출판사, ISBN 등 정보로 검색 가능합니다.
            </DrawerDescription>
          </DrawerHeader>

          {/* 검색 입력창 */}
          <div className="relative flex w-full h-10 py-3 bg-[#F5F5F5] items-center rounded-2xl">
            <div className="flex pl-4 items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              placeholder="책 정보 검색하기"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 border-none bg-transparent outline-none"
            />
            <div className="pr-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearch}
                disabled={isLoading || !searchTerm.trim()}
                className="h-8 px-2 text-gray-500"
              >
                {isLoading ? '검색 중...' : '검색'}
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          <div className="text-left flex justify-between items-center">
            <p className="text-[1.25rem] font-semibold">
              {searchTerm ? `검색 결과 ${totalCount}건` : '이달의 베스트셀러'}
            </p>
          </div>

          {isLoading && (
            <div className="flex justify-center py-8">
              <p className="text-gray-500">검색 중입니다...</p>
            </div>
          )}

          {error && (
            <div className="mt-6 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {!isLoading && !error && (searchResults.length === 0 || !searchTerm.trim()) ? (
            <div className="max-h-[50vh] overflow-y-auto pr-2 mt-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {!searchTerm.trim() && (
                <div>
                  <div className="grid grid-cols-5 gap-4">
                    {bestsellers.slice(0, 50).map((book, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-32 h-40 rounded-md overflow-hidden mb-2 relative"
                          onMouseEnter={() => setHoveredBookIndex(index)}
                          onMouseLeave={() => setHoveredBookIndex(null)}
                        >
                          <div className="w-full h-full">
                            <Image
                              src={book.cover || '/next.svg'}
                              alt={book.title}
                              fill
                              className={`w-full h-full object-cover transition-all duration-300 ${
                                hoveredBookIndex === index ? 'bg-black/40' : ''
                              }`}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>

                          {/* 호버 시 나타나는 추가 버튼 */}
                          {hoveredBookIndex === index && (
                            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300">
                              <button
                                className="bg-white text-gray-700 rounded-full flex items-center justify-center px-3 py-2 text-sm font-medium shadow-md"
                                onClick={() => onAddBook && onAddBook(book)}
                              >
                                <div className="flex items-center gap-2">
                                  <Plus className="text-gray-500" />
                                  <span className="text-xl">추가</span>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* 책 정보 */}
                        <div className="w-full text-left">
                          <div className="text-sm font-medium truncate">{book.title}</div>
                          <div className="text-xs text-gray-500 truncate">{book.author}</div>
                          <div className="text-xs text-gray-400 truncate">{book.publisher}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.length === 0 && searchTerm.trim() && (
                <div className="mt-6 text-center">
                  <p className="text-gray-500 text-sm">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="max-h-[50vh] overflow-y-auto pr-2 mt-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {searchResults.map((book, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-32 h-40 rounded-md overflow-hidden mb-2 relative"
                      onMouseEnter={() => setHoveredBookIndex(index)}
                      onMouseLeave={() => setHoveredBookIndex(null)}
                    >
                      <div className="w-full h-full">
                        <Image
                          src={book.cover || '/next.svg'}
                          alt={book.title}
                          fill
                          className={`w-full h-full object-cover transition-all duration-300 ${
                            hoveredBookIndex === index ? 'bg-black/40' : ''
                          }`}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>

                      {/* 호버 시 나타나는 추가 버튼 */}
                      {hoveredBookIndex === index && (
                        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300">
                          <button
                            className="bg-white text-gray-700 rounded-full flex items-center justify-center px-3 py-2 text-sm font-medium shadow-md"
                            onClick={() => onAddBook && onAddBook(book)}
                          >
                            <div className="flex items-center gap-2">
                              <Plus className="text-gray-500" />
                              <span className="text-xl">추가</span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 책 정보 */}
                    <div className="w-full text-left">
                      <div className="text-sm font-medium truncate">{book.title}</div>
                      <div className="text-xs text-gray-500 truncate">{book.author}</div>
                      <div className="text-xs text-gray-400 truncate">{book.publisher}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 페이지네이션 */}
          {searchResults.length > 0 && totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="h-8 w-8 p-0"
              >
                {'<'}
              </Button>

              <span className="text-sm">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="h-8 w-8 p-0"
              >
                {'>'}
              </Button>
            </div>
          )}

          <DrawerFooter>
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

// BookDetailCard 컴포넌트
const BookDetailCard: React.FC<BookDetailCardProps> = ({ book, onClose }) => {
  // Function to handle the "책 소개 보러가기" button click
  const handleViewBookInfo = () => {
    if (book.link) {
      window.open(book.link, '_blank'); // Open link in a new tab
    } else {
      const searchQuery = book.link
        ? `${book.link}`
        : `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord=${encodeURIComponent(book.title)}`;
      window.open(searchQuery, '_blank');
    }
  };

  return (
    <div className="w-[34.875rem] h-80 bg-[#F5F5F5] border-[1.5px] border-[#A3A3A3] rounded-2xl p-6 flex items-center justify-center">
      <div className="w-full h-full max-h-full overflow-y-auto">
        {/* 닫기 버튼 */}
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(100%-2rem)]">
          {/* 왼쪽: 책 커버 이미지 */}
          <div className="flex-shrink-0 mr-6">
            <div className="w-[11.25rem] h-[full] bg-gray-800 rounded-md overflow-hidden">
              <Image
                src={book.cover || ''}
                alt={book.title}
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* 오른쪽: 책 정보 */}
          <div className="flex-grow flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{book.title}</h2>
              <p className="text-lg text-gray-600 mb-1">{book.author} </p>
              <p className="text-gray-500 text-sm mb-1">
                {book.pubDate || '출판일 정보 없음'} ﹒ {book.publisher}
              </p>
              <p className="text-gray-500 text-sm">ISBN {book.isbn} </p>
            </div>

            {/* 책 소개 보러가기 버튼 */}
            <div className="mt-auto pt-4">
              <button
                onClick={handleViewBookInfo}
                className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-between"
              >
                <span>책 소개 보러가기</span>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 날짜 및 시간 선택 컴포넌트
const DateTimeSelector = ({
  selectedDateTime,
  onDateTimeChange,
  placeholder = 'YYYY.MM.DD 00:00',
}: {
  selectedDateTime?: Date;
  onDateTimeChange: (date?: Date) => void;
  placeholder?: string;
}) => {
  // 선택된 날짜와 시간을 상태로 관리
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(selectedDateTime);
  const [selectedTime, setSelectedTime] = useState<string>(
    selectedDateTime ? format(selectedDateTime, 'HH:mm') : '00:00',
  );

  // 날짜와 시간을 결합하는 함수
  const combineDateTime = (date?: Date, time?: string) => {
    if (!date) return undefined;

    const [hours, minutes] = (time || '00:00').split(':').map(Number);
    return set(date, { hours, minutes, seconds: 0, milliseconds: 0 });
  };

  // 날짜 선택 핸들러
  const handleDateSelect = (date?: Date) => {
    const newDateTime = combineDateTime(date, selectedTime);
    setSelectedDate(date);
    onDateTimeChange(newDateTime);
  };

  // 시간 변경 핸들러
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setSelectedTime(newTime);

    const newDateTime = combineDateTime(selectedDate, newTime);
    onDateTimeChange(newDateTime);
  };

  return (
    <div className="flex w-72 h-12 items-center border bg-white border-gray-200 rounded-lg">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'newbook'}
            className={cn(
              'justify-start text-left font-normal w-full',
              !selectedDateTime && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDateTime ? (
              format(selectedDateTime, 'yyyy.MM.dd HH:mm')
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 m-2 flex flex-col space-y-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="flex items-center bg-white p-2 border-t">
            <Input
              type="time"
              value={selectedTime}
              onChange={handleTimeChange}
              className="flex-grow bg-white"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// 북클럽용 책 추가 컴포넌트
interface AddBookToClubProps {
  clubId: number;
  onAddSuccess?: () => void;
}

interface BookSubmitData {
  isbn: string;
  title: string;
  description: string;
  authors: string;
  publisher: string;
  thumbnail: string;
  link: string;
  rating: number;
  status: string;
  startDateTime: string | null;
  endDateTime: string | null;
  clubId: number | null;
  memberIds: number[];
}

type StatusKey = 'ABANDONED' | 'READING' | 'COMPLETED' | 'GAVE_UP';

const AddBookToClub: React.FC<AddBookToClubProps> = ({ clubId, onAddSuccess }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [rating, setRating] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<StatusKey>('ABANDONED');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleAddBook = (book: Book) => {
    console.log('선택된 책:', book);
    setSelectedBook(book);
    setIsOpen(false);
  };

  const handleRatingChange = (value: number) => {
    if (rating === value) {
      setRating(0); // 같은 값을 클릭하면 초기화
    } else {
      setRating(value);
    }
  };

  function isValidStatusKey(value: string): value is StatusKey {
    return ['ABANDONED', 'READING', 'COMPLETED', 'GAVE_UP'].includes(value);
  }

  const handleValueChange = (value: string) => {
    if (isValidStatusKey(value)) {
      setSelectedStatus(value);
    } else {
      console.warn(`Invalid status value received: ${value}`);
      setSelectedStatus('ABANDONED'); // Default to a safe value
    }
  };

  const getStatusStyle = (status: StatusKey) => {
    const styles = {
      ABANDONED: { bg: 'bg-[#FFF3CD]', text: 'text-[#997404]', hover: 'hover:bg-[#FFE69C]' },
      READING: { bg: 'bg-[#D1FAE5]', text: 'text-green-800', hover: 'hover:bg-[#A7F3D0]' },
      COMPLETED: { bg: 'bg-[#DBEAFE]', text: 'text-blue-800', hover: 'hover:bg-[#BFDBFE]' },
      GAVE_UP: { bg: 'bg-[#FFE4E6]', text: 'text-red-800', hover: 'hover:bg-[#FECDD3]' },
    };

    return styles[status];
  };

  // 날짜를 "YYYY-MM-DD HH:MM:SS" 형식으로 변환
  const formatDateTimeForApi = (date?: Date): string | null => {
    if (!date) return null;
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  };

  const submitBook = async (bookData: BookSubmitData) => {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await axios.post('https://dev-api.libri.kr/booklogs', bookData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json;charset=UTF-8',
        },
      });

      console.log('북로그 생성 결과:', response.data);

      if (response.data && response.data.id) {
        console.log('생성된 북로그 ID:', response.data.id);
      }

      return response.data;
    } catch (error: unknown) {
      console.error('책 추가 오류:', error);

      // axios 에러 타입 검사
      if (axios.isAxiosError(error) && error.response) {
        console.error('오류 응답 데이터:', error.response.data);
      }

      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!selectedBook) {
      alert('책을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // API 요구사항에 맞게 데이터 구성
      const bookData: BookSubmitData = {
        isbn: selectedBook.isbn || '',
        title: selectedBook.title || '',
        description: selectedBook.description || '',
        authors: selectedBook.author || '',
        publisher: selectedBook.publisher || '',
        thumbnail: selectedBook.cover || '',
        link: selectedBook.link || '',
        rating: rating,
        status: selectedStatus,
        startDateTime: formatDateTimeForApi(startDate),
        endDateTime: formatDateTimeForApi(endDate),
        clubId: clubId,
        memberIds: [], // 북클럽에 추가할 때는 멤버 선택이 필요 없으므로 빈 배열로 설정
      };

      console.log('전송할 데이터:', bookData);

      const result = await submitBook(bookData);
      setSubmitSuccess(true);

      // 결과 ID 출력
      if (result && result.id) {
        console.log(`북로그가 성공적으로 생성되었습니다. ID: ${result.id}`);

        // 성공 콜백 호출
        if (onAddSuccess) {
          onAddSuccess();
        }

        // 생성된 북로그 페이지로 이동
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('북로그 생성 중 오류:', error);
      setSubmitError('책을 추가하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStyle = getStatusStyle(selectedStatus);

  return (
    <div className="flex flex-col items-center">
      {selectedBook ? (
        <div className="w-full">
          <div className="flex flex-col items-center mb-6">
            <BookDetailCard book={selectedBook} onClose={() => setSelectedBook(null)} />
          </div>

          <div className="flex flex-col gap-6 max-w-xl mx-auto mb-6">
            {/* 상태 선택 */}
            <div>
              <div className="flex w-full px-[0.25rem] py-[0.5rem] justify-between items-center text-lg font-medium">
                상태 & 평점
              </div>
              <div className="flex gap-4">
                <Select value={selectedStatus} onValueChange={handleValueChange}>
                  <SelectTrigger className="w-72 h-12 border border-gray-200 rounded-lg bg-white hover:bg-gray-50">
                    <SelectValue>
                      <span
                        className={`px-3 py-1 rounded-xl ${currentStyle.bg} ${currentStyle.text}`}
                      >
                        {selectedStatus === 'ABANDONED'
                          ? '읽고픈'
                          : selectedStatus === 'READING'
                            ? '읽는중'
                            : selectedStatus === 'COMPLETED'
                              ? '완독'
                              : '포기'}
                      </span>
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent className="w-72 bg-white border-2 border-[#374151] rounded-lg p-2 shadow-lg">
                    <SelectGroup className="space-y-1">
                      <SelectItem
                        value="ABANDONED"
                        className={`bg-[#FFF3CD] text-[#997404] hover:bg-[#FFE69C] rounded-full px-4 py-1 w-1/3 cursor-pointer text-sm font-medium`}
                      >
                        읽고픈
                      </SelectItem>

                      <SelectItem
                        value="READING"
                        className=" rounded-full px-4 py-1 bg-[#D1FAE5] text-green-800 hover:bg-[#A7F3D0] w-1/3 cursor-pointer text-sm font-medium"
                      >
                        읽는중
                      </SelectItem>

                      <SelectItem
                        value="COMPLETED"
                        className="bg-[#DBEAFE] text-blue-800 hover:bg-[#BFDBFE] rounded-full px-4 py-1 w-1/3 cursor-pointer text-sm font-medium"
                      >
                        완독
                      </SelectItem>
                      <SelectItem
                        value="GAVE_UP"
                        className="bg-[#FFE4E6] text-red-800 hover:bg-[#FECDD3] rounded-full px-4 py-1  w-1/3 cursor-pointer text-sm font-medium"
                      >
                        포기
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* 평점 선택 영역 */}
                <div>
                  <div className="flex items-center gap-4">
                    <div className="rating rating-lg rating-half flex justify-around items-center w-[11.25rem] h-12 p-[0.625rem] flex-shrink-0 rounded-lg border border-[#D4D4D4]">
                      <input type="radio" name="rating-10" className="rating-hidden" />
                      {[...Array(10)].map((_, index) => (
                        <input
                          key={index}
                          type="radio"
                          name="rating-10"
                          className={`mask mask-star-2 ${index % 2 === 0 ? 'mask-half-1' : 'mask-half-2'}`}
                          style={{ backgroundColor: rating > index ? '#FFF598' : '#E5E5E5' }}
                          checked={rating === index + 1}
                          onChange={() => handleRatingChange(index + 1)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 날짜 선택 */}
            <div className="flex w-full">
              <div className="mr-5">
                <div className="flex w-[18rem] px-[0.25rem] py-[0.5rem] justify-between items-center text-lg font-medium">
                  시작일
                </div>
                <DateTimeSelector selectedDateTime={startDate} onDateTimeChange={setStartDate} />
              </div>
              <div>
                <div className="flex w-[18rem] px-[0.25rem] py-[0.5rem] justify-between items-center text-lg font-medium">
                  마감일
                </div>
                <DateTimeSelector selectedDateTime={endDate} onDateTimeChange={setEndDate} />
              </div>
            </div>
          </div>

          {/* 상태 메시지 */}
          {submitError && <div className="text-red-600 mb-4 text-center">{submitError}</div>}

          {submitSuccess && (
            <div className="text-green-600 mb-4 text-center">책이 성공적으로 추가되었습니다.</div>
          )}

          {/* 생성하기 버튼 */}
          <div className="flex justify-center items-center w-full">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex text-center w-[18.5rem] h-16 px-4 py-2 rounded-[10rem] bg-[#215B32] hover:bg-green-700 text-white text-xl font-normal"
            >
              {isSubmitting ? '처리 중...' : '생성하기'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center my-8">
          <Button
            onClick={() => setIsOpen(true)}
            className="flex bg-[#ffffff] hover:bg-[#215B32] text-center w-[18.5rem] h-[4rem] px-2 py-4 rounded-[10rem] border-[#215B32] border-[2px] text-[#215B32] hover:text-white text-xl font-bold"
          >
            <CirclePlus size={28} className="mr-2" /> 책 추가하기
          </Button>
          <BookSearchDrawer isOpen={isOpen} setIsOpen={setIsOpen} onAddBook={handleAddBook} />
        </div>
      )}
    </div>
  );
};

export default AddBookToClub;
