'use client';

import { Book } from '@/lib/services/bookService';
import BookCard from './BookCard';
import { motion } from 'framer-motion';

interface BookGridProps {
  books: Book[];
  onBookClick?: (book: Book) => void;
  emptyMessage?: string;
}

const BookGrid = ({ books, onBookClick, emptyMessage = "No books found." }: BookGridProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (!books || books.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[300px] w-full">
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {books.map((book) => (
        <div key={book.isbn} className="h-full">
          <BookCard 
            book={book} 
            onClick={() => onBookClick && onBookClick(book)}
          />
        </div>
      ))}
    </motion.div>
  );
};

export default BookGrid; 