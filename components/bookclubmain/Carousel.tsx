// File: components/Carousel.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import BookClubCard, { BookClubCardProps } from './BookClubCard';

interface CarouselProps {
  items: BookClubCardProps[];
}

const Carousel = ({ items }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setDirection] = useState(1); // 1 for right, -1 for left
  const carouselRef = useRef<HTMLDivElement>(null);

  const visibleItems = 3; // Number of visible items

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < items.length - visibleItems) {
        setCurrentIndex((prev) => prev + 1);
        setDirection(1);
      } else {
        setCurrentIndex(0);
        setDirection(1);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, items.length]);

  return (
    <div className="relative w-full overflow-hidden py-4">
      <motion.div
        ref={carouselRef}
        className="flex"
        initial={false}
        animate={{
          x: `calc(-${currentIndex * (100 / visibleItems)}%)`,
        }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 20,
        }}
      >
        {items.map((item, index) => (
          <div key={index} className="flex-none w-1/3 px-2">
            <BookClubCard {...item} />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default Carousel;
