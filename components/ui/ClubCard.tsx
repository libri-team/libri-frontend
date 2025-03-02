'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';

interface ClubCardProps {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  className?: string;
  onClick?: () => void;
}

export const ClubCard = ({
  id,
  name,
  description,
  memberCount,
  className,
  onClick,
}: ClubCardProps) => {
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
        'flex flex-col overflow-hidden shadow-md bg-white rounded-lg p-6',
        'transition-all duration-300 border border-gray-100',
        className
      )}
      initial="initial"
      animate="animate"
      whileHover="hover"
      variants={cardVariants}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
        <div className="flex items-center text-sm text-gray-500">
          <Users size={16} className="mr-1" />
          <span>{memberCount}</span>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
        {description}
      </p>

      <div className="mt-auto">
        <Link 
          href={`/club/${id}`} 
          className="text-sm font-medium text-green-700 hover:text-green-900 hover:underline"
        >
          모임 자세히 보기
        </Link>
      </div>
    </motion.div>
  );
};

export default ClubCard; 