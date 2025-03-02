'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Book } from '@/lib/services/bookService';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BookCardProps {
  book: Book;
  className?: string;
  onClick?: () => void;
  showDetails?: boolean;
}

export const BookCard = ({
  book,
  className,
  onClick,
  showDetails = true,
}: BookCardProps) => {
  // Format authors list for display
  const authorText = Array.isArray(book.authors)
    ? book.authors.join(', ')
    : book.authors;

  // Truncate title if it's too long
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { 
      y: -10, 
      transition: { 
        type: 'spring', 
        stiffness: 300,
        duration: 0.3
      } 
    },
  };

  return (
    <motion.div
      className={cn(
        'flex flex-col rounded-md overflow-hidden shadow-md bg-white h-full',
        'transition-all duration-300',
        className
      )}
      initial="initial"
      animate="animate"
      whileHover="hover"
      variants={cardVariants}
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={book.thumbnail || '/placeholder-book.png'}
          alt={book.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ objectFit: 'cover' }}
        />
      </div>

      {showDetails && (
        <div className="p-4 flex flex-col flex-grow bg-white">
          <h3 className="text-md font-semibold text-gray-900 mb-1 line-clamp-2">
            {truncateText(book.title, 50)}
          </h3>
          
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{authorText}</p>
          
          <div className="mt-auto flex items-center justify-between">
            <span className="text-xs text-gray-500">{book.publisher}</span>
            <Link 
              href={`/books/${book.isbn}`} 
              className="text-xs text-green-700 hover:text-green-900 hover:underline"
            >
              상세보기
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BookCard; 