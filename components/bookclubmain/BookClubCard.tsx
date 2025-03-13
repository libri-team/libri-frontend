// File: components/BookClubCard.tsx
import React from 'react';
import Image from 'next/image';

export interface BookClubCardProps {
  imageUrl: string;
  title: string;
  description: string;
  hostName: string;
}

const BookClubCard = ({ imageUrl, title, description, hostName }: BookClubCardProps) => {
  return (
    <div className="relative rounded-lg shadow-md overflow-hidden w-72 h-80 bg-white mx-2 p-2">
      <div className="h-40 w-full relative">
        <Image
          src={imageUrl}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
        />
      </div>
      <div className="flex flex-col items-center p-2">
        <div className="font-bold text-xl my-2">{title}</div>
      </div>
      <p className="flex justify-center text-sm text-gray-600 mb-3">{description}</p>
      <div className="flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-black overflow-hidden mr-2"></div>
        <span className="text-xs text-gray-500 ">{hostName}</span>
      </div>
    </div>
  );
};

export default BookClubCard;
