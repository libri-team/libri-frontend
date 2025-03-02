'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import axios from 'axios';
import { format, set } from 'date-fns';
import { cn } from '@/lib/utils';
import { CirclePlus, Plus, Search, CalendarIcon, X } from 'lucide-react';
// import Navigation from '@/components/Navigation';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import Link from 'next/link';

import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface NavigationProps {
  isDrawerOpen?: boolean;
  nickname?: string | null; // 닉네임 prop 추가
}

const Navigation = ({ isDrawerOpen }: NavigationProps) => {
  const pathname = usePathname();
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    // 로컬 스토리지에서 회원 정보 가져오기
    const memberInfoString = localStorage.getItem('memberInfo');
    if (memberInfoString) {
      const memberInfo = JSON.parse(memberInfoString);
      setNickname(memberInfo.nickname);
    }
  }, []);

  // 독서모임 버튼 클릭 핸들러 추가
  const handleBookClubClick = (e: React.MouseEvent) => {
    e.preventDefault(); // 기본 링크 동작 방지
    alert('독서모임 기능은 추후에 업데이트 예정입니다.');
  };

  const logoVariants = {
    initial: { x: -20, opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, delay: 0.2 },
    },
  };

  const profileVariants = {
    initial: { x: 20, opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, delay: 0.2 },
    },
  };

  return (
    <>
      <motion.nav
        initial="hidden"
        animate="visible"
        className={`fixed top-0 left-0 right-0 w-full flex justify-center px-16 z-50 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-40' : 'opacity-100'
        }`}
        style={{ padding: '2.25rem 4rem 0 4rem' }}
      >
        <div className="w-full flex justify-between items-center z-50">
          <motion.div
            variants={logoVariants}
            initial="initial"
            animate="animate"
            whileHover={{
              scale: 1.05,
              transition: { type: 'spring', stiffness: 400 },
            }}
          >
            <Link href="/" className="block">
              <Image src="/logo.svg" width={110} height={100} alt="logo" />
            </Link>
          </motion.div>

          <div className="flex items-center justify-between w-[28rem] h-12">
            {[
              { href: '/newbook', label: '신규 책 추가', onClick: undefined },
              { href: '#', label: '독서 모임', onClick: handleBookClubClick }, // href를 #으로 변경하고 onClick 핸들러 추가
              { href: '/mylibrary', label: '내 서재', onClick: undefined },
            ].map((item) => (
              <motion.div
                key={item.href}
                className="relative h-full flex items-center"
                whileHover="hover"
              >
                <Link
                  href={item.href}
                  className={`
                    ${pathname === item.href ? 'text-green-700' : 'text-gray-700'}
                    text-xl font-semibold hover:text-white no-underline 
                    transition-all duration-200 relative px-4 py-2 
                    flex items-center justify-center h-full w-full
                    overflow-hidden
                  `}
                  onClick={item.onClick}
                >
                  <motion.span
                    className="relative z-10"
                    variants={{
                      hover: {
                        y: -2,
                        transition: { duration: 0.2 },
                      },
                    }}
                  >
                    {item.label}
                  </motion.span>

                  <motion.div
                    className="absolute inset-0 bg-green-700"
                    variants={{
                      hover: {
                        y: 0,
                        transition: { duration: 0.2 },
                      },
                    }}
                    initial={{ y: '100%' }}
                  />

                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700"
                    initial={{ scaleX: 0 }}
                    animate={{
                      scaleX: pathname === item.href ? 1 : 0,
                      transition: { duration: 0.3 },
                    }}
                    variants={{
                      hover: {
                        scaleX: 1,
                        transition: { duration: 0.2 },
                      },
                    }}
                    style={{
                      transformOrigin: 'center',
                    }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="flex items-center gap-4"
            variants={profileVariants}
            initial="initial"
            animate="animate"
          >
            <motion.button
              className="text-gray-600 cursor-pointer p-2"
              whileHover={{
                scale: 1.1,
                transition: { type: 'spring', stiffness: 400 },
              }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={25} />
            </motion.button>

            <motion.div
              className="flex items-center gap-2 p-2 rounded-full cursor-pointer"
              whileHover={{
                scale: 1.02,
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                transition: { duration: 0.2 },
              }}
            >
              <Image
                src="/profile.svg"
                width={40}
                height={40}
                className="rounded-full"
                alt="profile"
              />
              <span className="text-gray-700 font-medium">{nickname || 'Profile'}</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.nav>

      {isDrawerOpen && <div className="fixed top-0 left-0 right-0 h-24 z-40" />}
    </>
  );
};
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
const BookSearchDrawer: React.FC<BookSearchDrawerProps> = ({ isOpen, setIsOpen, onAddBook }) => {
  const [hoveredBookIndex, setHoveredBookIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // 검색 함수
  const searchBooks = async (keyword: string, page: number = 1) => {
    if (!keyword.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // 토큰을 localStorage에서 가져오기
      const token = localStorage.getItem('accessToken');

      const response = await axios.get('https://dev-api.libri.kr/api/aladin/search', {
        params: {
          keyword: keyword.trim(),
          page: page - 1, // API가 0부터 시작하므로 page - 1 처리
          size: pageSize,
        },
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`, // 토큰 헤더에 추가
        },
      });

      const data = response.data;

      // 기존 로직 유지
      if (data && Array.isArray(data.books)) {
        setTotalCount(data.totalCount || 0);
        setTotalPages(Math.ceil((data.totalCount || 0) / pageSize));

        // API 응답을 Book 타입으로 변환
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

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger className="hidden" />
      <DrawerContent className="flex items-center justify-center rounded-2xl h-[90vh]">
        <div className="flex w-48 mb-5 bg-[#F1F1F1] rounded-full p-[0.5rem] shrink-0 items-start gap-[0.625rem]"></div>

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
              {searchTerm ? `검색 결과 ${totalCount}건` : '도서 검색 결과'}
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

          {!isLoading && !error && searchResults.length === 0 ? (
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                {searchTerm ? '검색 결과가 없습니다.' : '검색어를 입력하고 검색 버튼을 눌러주세요.'}
              </p>
            </div>
          ) : (
            <div className="max-h-[50vh] overflow-y-auto pr-2 mt-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {searchResults.map((book, index) => (
                  <div key={index} className="flex flex-col items-center">
                    {/* 책 커버 이미지 */}
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
const BookDetailCard: React.FC<BookDetailCardProps> = ({ book, onClose }) => {
  // Function to handle the "책 소개 보러가기" button click
  const handleViewBookInfo = () => {
    if (book.link) {
      window.open(book.link, '_blank'); // Open link in a new tab
    } else {
      const searchQuery = book.isbn
        ? `${book.link}`
        : `https://search.daum.net/search?w=book&q=${encodeURIComponent(book.title)}`;
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
  clubId: null;
}
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
// Modify the NewBookPage component to include the submit functionality
const NewBookPage = () => {
  // 기존 상태 유지
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<StatusKey>('ABANDONED');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // 날짜 및 시간 선택 컴포넌트 추가
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
      <div className="flex w-72 h-12 items-center border border-gray-200 rounded-lg">
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
            <div className="flex items-center p-2 border-t">
              <Input
                type="time"
                value={selectedTime}
                onChange={handleTimeChange}
                className="flex-grow"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  type StatusKey = 'ABANDONED' | 'READING' | 'COMPLETED' | 'GAVE_UP';

  const handleAddBook = (book: Book) => {
    console.log('선택된 책:', book); // 전달되는 데이터 확인
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
      // TypeScript now knows this is safe
      setSelectedStatus(value);
    } else {
      // Handle invalid values gracefully
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

  // Function to format date to "YYYY-MM-DD HH:MM:SS"
  const formatDateTimeForApi = (date?: Date): string | null => {
    if (!date) return null;
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  };

  // 수정된 handleSubmit 함수
  const handleSubmit = async () => {
    if (!selectedBook) {
      alert('책을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 필드명을 API 요구사항에 맞게 변환
      const bookData = {
        isbn: selectedBook.isbn || '',
        title: selectedBook.title || '',
        description: selectedBook.description || '',
        authors: selectedBook.author || '', // author 필드를 authors로 변환
        publisher: selectedBook.publisher || '',
        thumbnail: selectedBook.cover || '', // cover 필드를 thumbnail로 변환
        link: selectedBook.link || '',
        rating: rating,
        status: selectedStatus,
        startDateTime: formatDateTimeForApi(startDate),
        endDateTime: formatDateTimeForApi(endDate),
        clubId: null,
      };

      console.log('전송할 데이터:', bookData);

      const result = await submitBook(bookData);
      setSubmitSuccess(true);

      // 결과 ID 출력
      if (result && result.id) {
        console.log(`북로그가 성공적으로 생성되었습니다. ID: ${result.id}`);
      }

      // 성공 후 리디렉션 또는 초기화
      setTimeout(() => {
        window.location.href = '/mylibrary'; // 필요한 경로로 조정
      }, 1000);
    } catch (error) {
      console.error('북로그 생성 중 오류:', error);
      setSubmitError('책을 추가하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStyle = getStatusStyle(selectedStatus);

  return (
    <div
      className={`min-h-screen w-full bg-[#eef0ed] min-w-sm relative transition-all duration-300 ease-in-out flex flex-col ${
        isOpen ? 'scale-[0.98] rounded-xl overflow-hidden' : 'scale-100'
      }`}
    >
      <Navigation isDrawerOpen={isOpen} />
      <div className="absolute top-48 left-0 right-0 z-0 flex justify-center">
        <h1 className="font-playfair text-[17.5rem] font-normal leading-[22.75rem] text-[#183C23] opacity-15 whitespace-nowrap">
          Add New book
        </h1>
      </div>

      <main className="relative z-10 pt-[11.75rem] flex flex-col flex-grow">
        <div className="relative text-center mb-[5.25rem]">
          <h2 className="text-[2.375rem] font-semibold text-gray-800">신규 책 추가</h2>
          <p className="text-[1.125rem] text-[#737373]">읽고 싶은, 읽고 있는 또는 다 읽은 책을</p>
        </div>

        <div className="flex-grow flex flex-col  w-full items-center justify-center bg-white  px-[22.69rem] ">
          <div className="flex items-center mb-[5.88rem] gap-10">
            {/* 왼쪽 컨텐츠 */}
            <div>
              <h3 className="text-xl font-medium mb-4">책 정보</h3>

              {selectedBook ? (
                <BookDetailCard book={selectedBook} onClose={() => setSelectedBook(null)} />
              ) : (
                <div className="flex w-[34.875rem] h-80 bg-[#F5F5F5] border-[2px] border-dashed border-[#A3A3A3] rounded-2xl p-6 items-center justify-center">
                  <Button
                    onClick={() => setIsOpen(true)}
                    variant="outline"
                    className="flex bg-white items-center justify-center w-[10rem] px-[0.75rem] py-[0.375rem] text-green-900 border-2 rounded border-[#215B32] hover:bg-green-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex-grow text-center text-base">책 정보 검색하기</span>
                      <CirclePlus className="w-5 h-5" />
                    </div>
                  </Button>
                </div>
              )}
              <BookSearchDrawer isOpen={isOpen} setIsOpen={setIsOpen} onAddBook={handleAddBook} />
            </div>

            {/* 오른쪽 컨텐츠 */}
            <div className="flex flex-col justify-end w-[37.25rem] h-80 mt-auto">
              <div className="flex flex-col gap-6">
                <div>
                  <div className="flex w-[18rem] px-[0.25rem] py-[0.5rem] justify-between items-center text-lg font-medium">
                    상태
                  </div>
                  <div>
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

                      <SelectContent className="w-72 bg-white border-2  border-[#374151] rounded-lg p-2 shadow-lg">
                        <SelectGroup className="space-y-1">
                          <SelectItem
                            value="ABANDONED"
                            className={` bg-[#FFF3CD] text-[#997404] hover:bg-[#FFE69C]  rounded-full px-4 py-1 cursor-pointer text-sm font-medium`}
                          >
                            읽고픈
                          </SelectItem>

                          <SelectItem
                            value="READING"
                            className="rounded-full px-4 py-1  bg-[#D1FAE5] text-green-800 hover:bg-[#A7F3D0] cursor-pointer text-sm font-medium"
                          >
                            읽는중
                          </SelectItem>

                          <SelectItem
                            value="COMPLETED"
                            className="bg-[#DBEAFE] text-blue-800 hover:bg-[#BFDBFE] rounded-full px-4 py-1 cursor-pointer text-sm font-medium"
                          >
                            완독
                          </SelectItem>
                          <SelectItem
                            value="GAVE_UP"
                            className="bg-[#FFE4E6] text-red-800 hover:bg-[#FECDD3] rounded-full px-4 py-1 cursor-pointer text-sm font-medium"
                          >
                            포기
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex w-full">
                  <div className="mr-5">
                    <div className="flex w-[18rem] px-[0.25rem] py-[0.5rem] justify-between items-center text-lg font-medium">
                      시작일
                    </div>
                    <DateTimeSelector
                      selectedDateTime={startDate}
                      onDateTimeChange={setStartDate}
                    />
                  </div>
                  <div>
                    <div className="flex w-[18rem] px-[0.25rem] py-[0.5rem] justify-between items-center text-lg font-medium">
                      마감일
                    </div>
                    <DateTimeSelector selectedDateTime={endDate} onDateTimeChange={setEndDate} />
                  </div>
                </div>
                <div>
                  <div className="flex w-[18rem] px-[0.25rem] py-[0.5rem] justify-between items-center text-lg font-medium">
                    평점
                  </div>
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

          {/* Status Messages */}
          {submitError && <div className="text-red-600 mb-4 text-center">{submitError}</div>}

          {submitSuccess && (
            <div className="text-green-600 mb-4 text-center">책이 성공적으로 추가되었습니다.</div>
          )}

          {/*  아래 생성하기  */}
          <div className="flex justify-center items-center shrink-0 w-[18.5rem] h-16">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedBook}
              className="flex text-center w-full h-full px-4 py-2 rounded-[10rem] bg-[#215B32] hover:bg-green-700 text-white text-xl font-normal"
            >
              {isSubmitting ? '처리 중...' : '생성하기'}
            </Button>
          </div>
        </div>
      </main>

      {/* Overlay for drawer */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
    </div>
  );
};

export default NewBookPage;
