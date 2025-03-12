'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ImagePlus, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Rule {
  dateCount: number;
  ruleStatus: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  bookCount: number;
  rule: string;
}

interface BookClubCardProps {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  fileUrl?: string | null;
  createdAt?: string;
  rules?: Rule[];
}

const BookClubCard: React.FC<BookClubCardProps> = ({
  id,
  name,
  description,

  fileUrl: initialFileUrl,

  rules,
}) => {
  const router = useRouter();
  const [fileUrl, setFileUrl] = useState<string | null | undefined>(initialFileUrl);
  const [isHovered, setIsHovered] = useState(false);
  const [, setIsImageAdded] = useState(false);

  useEffect(() => {
    // 외부에서 fileUrl이 변경되면 상태 업데이트
    setFileUrl(initialFileUrl);
  }, [initialFileUrl]);

  // 규칙 표시 텍스트 생성
  const getRuleDisplayText = (rule?: Rule): string => {
    if (!rule) return '';

    let period = '';
    switch (rule.ruleStatus) {
      case 'DAY':
        period = '일';
        break;
      case 'WEEK':
        period = '주';
        break;
      case 'MONTH':
        period = '월';
        break;
      case 'YEAR':
        period = '년';
        break;
    }

    return `${rule.dateCount}${period}에 한 권 읽기`;
  };

  const handleAddImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('accessToken');

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';

      fileInput.onchange = async (event) => {
        const files = (event.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          const formData = new FormData();
          formData.append('file', files[0]);

          try {
            const response = await fetch(`https://dev-api.libri.kr/club/file?id=${id}`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            });

            const responseText = await response.text();
            console.log('응답 원본:', responseText);

            if (response.ok) {
              try {
                const data = responseText ? JSON.parse(responseText) : {};

                const newFileUrl =
                  data.fileUrl ||
                  (data.data && data.data.fileUrl) ||
                  (data.result && data.result.fileUrl);

                if (newFileUrl) {
                  // 이미지 URL 상태 업데이트 및 리렌더링 트리거
                  setFileUrl(newFileUrl);
                  setIsImageAdded(true);
                } else {
                  console.warn('파일 URL을 찾을 수 없음:', data);
                  window.location.reload(); // 실패 시 새로고침
                }
              } catch (jsonError) {
                console.error('JSON 파싱 오류:', jsonError);
                if (responseText.includes('http')) {
                  const newFileUrl = responseText.trim();
                  setFileUrl(newFileUrl);
                  setIsImageAdded(true);
                  window.location.reload(); // 실패 시 새로고침
                }
              }
            } else {
              console.error('이미지 업로드 실패:', responseText);
              window.location.reload(); // 실패 시 새로고침
            }
          } catch (uploadError) {
            console.error('이미지 업로드 중 네트워크 오류:', uploadError);
            window.location.reload(); // 실패 시 새로고침
          }
        }
      };

      fileInput.click();
    } catch (error) {
      console.error('이미지 추가 중 오류:', error);
    }
  };

  return (
    <div
      className="w-full h-full bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      aria-label={`${name} 독서 모임 상세보기`}
      onClick={() => router.push(`/bookclub/${id}`)}
    >
      {/* 카드 헤더 */}
      <div className="h-40 relative">
        <Image
          layout="fill"
          key={fileUrl}
          src={fileUrl || '/logo.svg'}
          alt={`${name} 모임 이미지`}
          className={`w-full h-full object-cover ${!fileUrl ? 'p-3' : ''}`}
          onError={(e) => {
            const imgElement = e.target as HTMLImageElement;
            imgElement.src = '/logo.svg';
          }}
        />

        {!fileUrl && isHovered && (
          <div
            className="absolute top-0 left-0 right-0 bottom-0 z-10"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              transition: 'all 0.3s ease',
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleAddImage(e);
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <Button
                className="bg-white w-36 h-36 text-green-600 hover:bg-green-50"
                style={{
                  transition: 'all 0.2s ease',
                  transform: isHovered ? 'scale(1)' : 'scale(0.9)',
                }}
              >
                <ImagePlus className="mr-2" /> 이미지 추가
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 카드 콘텐츠 */}
      <div className="p-3">
        <h3 className="text-gray-800 font-medium text-lg mb-3 line-clamp-2">{name}</h3>

        {description && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>}

        <div className="flex flex-col gap-3">
          {/* 규칙 정보 - 좀 더 강조 */}
          {rules && rules.length > 0 && (
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <BookOpen size={18} className="mr-2 text-green-600" />
                <span className="font-medium text-gray-700">목표</span>
              </div>

              <div className="ml-2">
                {rules.map((rule, index) => (
                  <div key={index} className="flex items-center mb-1 last:mb-0">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-sm rounded-md">
                      {getRuleDisplayText(rule)}
                    </span>
                    {rule.rule && rule.rule !== '규칙' && rule.rule !== '규칙을 적어주세요' && (
                      <span className="ml-2 text-xs text-gray-500 line-clamp-1">{rule.rule}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookClubCard;
