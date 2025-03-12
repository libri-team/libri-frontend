'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { CirclePlus, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileImageUploaderProps {
  onImageSelect: (file: File | null) => void;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({ onImageSelect }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Open file selection dialog on upload button click
  const handleUploadClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'image/png' || file.type === 'image/jpeg') {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage(e.target.result as string);
          onImageSelect(file);
          console.log('이미지가 로드되었습니다.');
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('PNG 또는 JPG 파일만 업로드 가능합니다.');
    }
  };

  // Hover state management
  const handleMouseEnter = (): void => {
    if (image) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = (): void => {
    setIsHovering(false);
  };

  // Remove image
  const handleRemoveImage = (): void => {
    setImage(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="flex w-[36.375rem] h-[27.5rem] bg-[#F5F5F5] border-2 border-dashed border-[#A3A3A3] rounded-2xl relative overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {image ? (
        <>
          <div className="w-full h-full relative">
            <Image
              src={image}
              alt="프로필 이미지"
              layout="fill"
              objectFit="cover"
              className={`transition-all duration-300 ${isHovering ? 'brightness-[0.6]' : ''}`}
            />

            {isHovering && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <button
                  onClick={handleUploadClick}
                  className="bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-md hover:bg-gray-50"
                  aria-label="이미지 수정"
                  type="button"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 11.5V14H4.5L11.8733 6.62667L9.37333 4.12667L2 11.5ZM13.8067 4.69333C14.0667 4.43333 14.0667 4.01333 13.8067 3.75333L12.2467 2.19333C11.9867 1.93333 11.5667 1.93333 11.3067 2.19333L10.0867 3.41333L12.5867 5.91333L13.8067 4.69333Z"
                      fill="#6B7280"
                    />
                  </svg>
                  <span>수정하기</span>
                </button>

                <button
                  onClick={handleRemoveImage}
                  className="bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-md hover:bg-gray-50"
                  aria-label="이미지 삭제"
                  type="button"
                >
                  <X className="w-4 h-4 text-gray-500" />
                  <span>삭제하기</span>
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full p-6">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>

          <h3 className="text-lg font-medium text-gray-700 mb-2">프로필 사진을 업로드해주세요</h3>
          <p className="text-sm text-gray-500 mb-6 text-center">
            PNG, JPG 형식의 이미지 파일만 가능합니다.
          </p>

          <Button
            onClick={handleUploadClick}
            variant="outline"
            className="flex bg-white items-center justify-center w-[10rem] px-[0.75rem] py-[0.375rem] text-green-900 border-2 rounded border-[#215B32] hover:bg-green-50"
          >
            <div className="flex items-center gap-2">
              <span className="flex-grow text-center text-base">프로필 사진 넣기 </span>
              <CirclePlus className="w-5 h-5" />
            </div>
          </Button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".png,.jpg,.jpeg"
        className="hidden"
        id="profile-image-input"
      />
    </div>
  );
};

export default ProfileImageUploader;
