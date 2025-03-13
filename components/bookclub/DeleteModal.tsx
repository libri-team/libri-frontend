'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: number;
  clubName?: string;
}

const DeleteClubModal: React.FC<DeleteClubModalProps> = ({ isOpen, onClose, clubId }) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // hover 상태 관리를 위한 state

  const [deleteHovered, setDeleteHovered] = useState(false);

  // 토큰 가져오기 함수
  const getTokenFromStorage = (): string | null => {
    let token = null;

    // 가능한 토큰 키 이름들
    const possibleKeys = [
      'token',
      'access_token',
      'accessToken',
      'jwtToken',
      'jwt',
      'authToken',
      'bearerToken',
    ];

    // 로컬 스토리지에서 토큰 찾기
    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          // JSON 형식인지 시도
          const parsed = JSON.parse(value);
          // 객체인 경우 토큰 필드 찾기
          if (typeof parsed === 'object' && parsed !== null) {
            token = parsed.token || parsed.access_token || parsed.jwt || parsed;
          } else {
            token = parsed;
          }
        } catch {
          token = value;
        }
        break;
      }
    }

    if (!token) {
      // memberInfo 객체 내부에 토큰이 있는지 확인
      const memberInfoString = localStorage.getItem('memberInfo');
      if (memberInfoString) {
        try {
          const memberInfo = JSON.parse(memberInfoString);
          token = memberInfo.token || memberInfo.access_token || memberInfo.jwt;
        } catch (e) {
          console.error('memberInfo 파싱 오류:', e);
        }
      }
    }

    return token;
  };

  // 모임 삭제 처리 함수
  const handleDeleteClub = async () => {
    if (!clubId) return;

    setIsDeleting(true);
    setError(null);

    try {
      const token = getTokenFromStorage();

      if (!token) {
        throw new Error('인증 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      }

      const response = await fetch(`https://dev-api.libri.kr/club/delete/${clubId}`, {
        method: 'PUT',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `서버 오류: ${response.status}`);
      }

      // 성공적으로 삭제된 경우
      onClose();
      router.push('/bookclub'); // 북클럽 목록 페이지로 이동
      router.refresh(); // 페이지 새로고침 (최신 데이터 반영)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '모임 삭제에 실패했습니다. 다시 시도해주세요.';
      setError(errorMessage);
      console.error('모임 삭제 실패:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 모달 배경 오버레이 */}
      <div className="fixed inset-0 bg-black/60 z-10" onClick={onClose} />

      {/* 모달 컨테이너 */}
      <div
        className="fixed bg-white rounded-lg shadow-xl w-full max-w-md"
        style={{
          bottom: '50%',
          left: '50%',
          transform: 'translate(-50%, 50%)',
          zIndex: 10,
        }}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            정말 해당 모임에서 탈퇴하시겠습니까?
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            모임에서 탈퇴 시 더 이상 이 기록을 다시 볼 수 없습니다.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={handleDeleteClub}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md"
              style={{
                backgroundColor: deleteHovered ? '#B91C1C' : '#EF4444',
                transition: 'background-color 0.2s',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={() => setDeleteHovered(true)}
              onMouseLeave={() => setDeleteHovered(false)}
              disabled={isDeleting}
            >
              {isDeleting ? '처리 중...' : '탈퇴'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteClubModal;
