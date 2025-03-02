'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BookLogSummary } from '@/lib/services/booklogService';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BookLogCardProps {
  bookLog: BookLogSummary;
  className?: string;
  onClick?: () => void;
}

export const BookLogCard = ({
  bookLog,
  className,
  onClick,
}: BookLogCardProps) => {
  // Format authors text for display
  const authorText = bookLog.authors;

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { 
      y: -5, 
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
        'flex overflow-hidden shadow-md bg-white rounded-lg',
        'transition-all duration-300',
        className
      )}
      initial="initial"
      animate="animate"
      whileHover="hover"
      variants={cardVariants}
      onClick={onClick}
    >
      <div className="relative w-20 sm:w-32 flex-shrink-0">
        <Image
          src={bookLog.thumbnail || '/placeholder-book.png'}
          alt={bookLog.title}
          fill
          className="object-cover"
          style={{ objectFit: 'cover' }}
        />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-md font-semibold text-gray-900 mb-1 line-clamp-2">
          {bookLog.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-2 line-clamp-1">{authorText}</p>
        
        <div className="mt-auto">
          <Link 
            href={`/booklogs/${bookLog.id}`} 
            className="text-sm text-green-700 hover:text-green-900 hover:underline"
          >
            자세히 보기
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default BookLogCard; 