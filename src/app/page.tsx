'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bell } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface NavigationProps {
  isDrawerOpen?: boolean;
  nickname?: string | null;
}

// 새로운 통합 알림 인터페이스
interface Notification {
  type: 'CLUB_INVITE' | 'BOOK_LOG_INVITE';
  inviteId: string;
  clubId: number | null;
  clubName: string | null;
  bookName: string | null;
  invitor: string;
  sendDateTime: string;
}

interface NotificationsResponse {
  notification: Notification[];
}

// 책 로그 초대 수락 응답 인터페이스
interface BookLogInviteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const Navigation = ({ isDrawerOpen }: NavigationProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [nickname, setNickname] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [, setIsAnimationReady] = useState(false);

  useEffect(() => {
    setIsAnimationReady(true);
  }, []);

  useEffect(() => {
    console.log('로딩 상태 변경:', isLoading);
    console.log('알림 데이터:', notifications);
  }, [isLoading, notifications]);

  // 로컬 스토리지에서 정보 가져오기
  useEffect(() => {
    // 로컬 스토리지에서 회원 정보 가져오기
    const memberInfoString = localStorage.getItem('memberInfo');
    const token = localStorage.getItem('accessToken');

    if (memberInfoString) {
      try {
        const memberInfo = JSON.parse(memberInfoString);
        setNickname(memberInfo.nickname);
        setIsLoggedIn(true);
      } catch (e) {
        console.error('memberInfo 파싱 오류:', e);
        setIsLoggedIn(false);
      }
    } else if (token) {
      // 토큰은 있지만 회원 정보가 없는 경우
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // 로그인 상태일 때만 알림 정보 확인
  useEffect(() => {
    if (isLoggedIn) {
      checkForNotifications();
    }
  }, [isLoggedIn]);

  // 프로필 클릭 핸들러
  const handleProfileClick = () => {
    router.push('/login');
  };

  // 토큰 가져오기 함수
  const getTokenFromStorage = (): string | null => {
    // 먼저 accessToken에서 직접 가져오기
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) return accessToken;

    // 찾지 못한 경우 memberInfo에서 시도
    const memberInfoString = localStorage.getItem('memberInfo');
    if (memberInfoString) {
      try {
        const memberInfo = JSON.parse(memberInfoString);
        return memberInfo.token || memberInfo.accessToken;
      } catch (e) {
        console.error('memberInfo 파싱 오류:', e);
      }
    }

    return null;
  };

  // 알림이 있는지 확인하는 함수 (빨간 점 표시용)
  const checkForNotifications = async () => {
    try {
      const token = getTokenFromStorage();

      if (!token) {
        return;
      }

      const response = await fetch('https://dev-api.libri.kr/notification/invites', {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const data: NotificationsResponse = await response.json();

      if (data && Array.isArray(data.notification) && data.notification.length > 0) {
        setHasUnreadNotifications(true);
      } else {
        setHasUnreadNotifications(false);
      }
    } catch (err) {
      console.error('알림 확인 오류:', err);
    }
  };

  // 새로운 API에서 알림 정보 가져오기
  const fetchNotifications = async () => {
    console.log('fetchNotifications 시작');
    setIsLoading(true);
    setError(null);

    try {
      const token = getTokenFromStorage();

      if (!token) {
        throw new Error('인증 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      }

      console.log('토큰 타입:', typeof token);
      console.log(
        '토큰 값 (앞부분만):',
        typeof token === 'string' ? token.substring(0, 15) + '...' : 'not a string',
      );

      const response = await fetch('https://dev-api.libri.kr/notification/invites', {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data: NotificationsResponse = await response.json();
      console.log('받은 알림 데이터:', data);

      if (data && Array.isArray(data.notification)) {
        setNotifications(data.notification);
        // 알림을 확인하면 빨간 점 표시 제거
        if (data.notification.length > 0) {
          setHasUnreadNotifications(false);
        }
      } else {
        console.error('유효하지 않은 알림 데이터 형식:', data);
        setNotifications([]);
      }
    } catch (err: unknown) {
      console.error('알림 목록 가져오기 실패:', err);

      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';

      setError(errorMessage || '알림 정보를 불러오는데 실패했습니다');
    } finally {
      console.log('로딩 상태를 false로 설정');
      setIsLoading(false);
    }
  };

  // 알림 아이콘 클릭 시 알림 정보 가져오기
  const handleNotificationClick = () => {
    // 로그인 상태가 아니면 로그인 페이지로 리다이렉트
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      fetchNotifications();
    }
  };

  // 북클럽 초대 수락 처리
  const handleAcceptClubInvitation = async (clubId: number, inviteId: string) => {
    try {
      const token = getTokenFromStorage();

      if (!token) {
        throw new Error('인증 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      }

      // PUT 메서드 사용
      const response = await fetch(`https://dev-api.libri.kr/club/invite`, {
        method: 'PUT',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json;charset=UTF-8',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clubId: clubId,
          isJoin: true,
        }),
      });

      if (!response.ok) {
        console.error(`초대 수락 요청 실패: ${response.status}`);

        // 응답 본문 확인 시도
        try {
          const errorData = await response.json();
          console.error('오류 상세 정보:', errorData);
        } catch {
          console.error('오류 본문 파싱 실패');
        }

        throw new Error(`API 오류: ${response.status}`);
      }

      // 성공적으로 수락했다면 목록에서 제거
      setNotifications(notifications.filter((notif) => notif.inviteId !== inviteId));
      alert('북클럽 초대를 수락했습니다.');
    } catch (err: unknown) {
      console.error('초대 수락 실패:', err);

      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';

      alert(`초대 수락에 실패했습니다: ${errorMessage}`);
    }
  };

  // 북클럽 초대 거부 처리
  const handleRejectClubInvitation = async (clubId: number, inviteId: string) => {
    try {
      const token = getTokenFromStorage();

      if (!token) {
        throw new Error('인증 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      }

      // PUT 메서드 사용
      const response = await fetch(`https://dev-api.libri.kr/club/invite`, {
        method: 'PUT',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json;charset=UTF-8',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clubId: clubId,
          isJoin: false,
        }),
      });

      if (!response.ok) {
        console.error(`초대 거부 요청 실패: ${response.status}`);

        // 응답 본문 확인 시도
        try {
          const errorData = await response.json();
          console.error('오류 상세 정보:', errorData);
        } catch {
          console.error('오류 본문 파싱 실패');
        }

        throw new Error(`API 오류: ${response.status}`);
      }

      // 성공적으로 거부했다면 목록에서 제거
      setNotifications(notifications.filter((notif) => notif.inviteId !== inviteId));
      alert('북클럽 초대를 거부했습니다.');
    } catch (err: unknown) {
      console.error('초대 거부 실패:', err);

      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';

      alert(`초대 거부에 실패했습니다: ${errorMessage}`);
    }
  };

  // 책 로그 초대 수락 처리 함수
  const handleAcceptBookLogInvitation = async (
    inviteId: string,
    onSuccess?: () => void,
    onError?: (error: string) => void,
  ): Promise<void> => {
    try {
      // 인증 토큰 검증
      const token = getTokenFromStorage();
      if (!token) {
        throw new Error('인증 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      }

      // API 요청 옵션 구성
      const requestOptions: RequestInit = {
        method: 'PUT',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteId: inviteId,
          isApproval: true, // 명시적으로 승인 상태 추가
        }),
      };

      // API 엔드포인트 URL 생성
      const apiUrl = `https://dev-api.libri.kr/booklog-invites/${inviteId}/approval`;

      // API 호출
      const response = await fetch(apiUrl, requestOptions);

      // 응답 본문 파싱
      const responseData: BookLogInviteResponse = await response.json();

      // 응답 상태 확인
      if (!response.ok) {
        // 오류 로깅
        console.error('책 로그 초대 수락 요청 실패:', {
          status: response.status,
          error: responseData.error || '알 수 없는 오류가 발생했습니다.',
        });

        // 오류 콜백 호출 또는 기본 오류 처리
        const errorMessage = responseData.error || `API 오류: ${response.status}`;

        if (onError) {
          onError(errorMessage);
        } else {
          alert(`초대 수락에 실패했습니다: ${errorMessage}`);
        }

        return;
      }

      // 성공적인 초대 수락 처리
      console.log('책 로그 초대 수락 성공:', responseData.message);

      // 알림 목록에서 해당 알림 제거
      setNotifications(notifications.filter((notif) => notif.inviteId !== inviteId));

      // 성공 콜백 호출 또는 기본 성공 처리
      if (onSuccess) {
        onSuccess();
      } else {
        alert('책 함께 읽기 초대를 수락했습니다.');
      }
    } catch (err: unknown) {
      // 네트워크 오류 등 예외 처리
      console.error('책 로그 초대 수락 중 예외 발생:', err);

      const errorMessage =
        err instanceof Error ? err.message : '네트워크 오류로 초대 수락에 실패했습니다.';

      alert(errorMessage);
    }
  };

  // 책 로그 초대 거절 응답 인터페이스
  interface BookLogInviteRejectionResponse {
    success: boolean;
    message?: string;
    error?: string;
  }

  // 책 로그 초대 거절 처리 함수
  const handleRejectBookLogInvitation = async (
    inviteId: string,
    onSuccess?: () => void,
    onError?: (error: string) => void,
  ): Promise<void> => {
    try {
      // 인증 토큰 검증
      const token = getTokenFromStorage();
      if (!token) {
        throw new Error('인증 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      }

      // API 요청 옵션 구성
      const requestOptions: RequestInit = {
        method: 'PUT', // 메서드를 PUT으로 변경
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteId: inviteId,
          isApproval: false, // 명시적으로 거절 상태 추가
        }),
      };

      // API 엔드포인트 URL 생성
      const apiUrl = `https://dev-api.libri.kr/booklog-invites/${inviteId}/rejection`;

      // API 호출
      const response = await fetch(apiUrl, requestOptions);

      // 응답 본문 파싱
      const responseData: BookLogInviteRejectionResponse = await response.json();

      // 응답 상태 확인
      if (!response.ok) {
        // 오류 로깅
        console.error('책 로그 초대 거절 요청 실패:', {
          status: response.status,
          error: responseData.error || '알 수 없는 오류가 발생했습니다.',
        });

        // 오류 콜백 호출 또는 기본 오류 처리
        const errorMessage = responseData.error || `API 오류: ${response.status}`;

        if (onError) {
          onError(errorMessage);
        } else {
          alert(`초대 거절에 실패했습니다: ${errorMessage}`);
        }

        return;
      }

      // 성공적인 초대 거절 처리
      console.log('책 로그 초대 거절 성공:', responseData.message);

      // 알림 목록에서 해당 알림 제거
      setNotifications(notifications.filter((notif) => notif.inviteId !== inviteId));

      // 성공 콜백 호출 또는 기본 성공 처리
      if (onSuccess) {
        onSuccess();
      } else {
        alert('책 함께 읽기 초대를 거절했습니다.');
      }
    } catch (err: unknown) {
      // 네트워크 오류 등 예외 처리
      console.error('책 로그 초대 거절 중 예외 발생:', err);

      const errorMessage =
        err instanceof Error ? err.message : '네트워크 오류로 초대 거절에 실패했습니다.';

      alert(errorMessage);
    }
  };
  // 알림 처리 함수
  const handleAcceptInvitation = (notification: Notification) => {
    if (notification.type === 'CLUB_INVITE' && notification.clubId) {
      handleAcceptClubInvitation(notification.clubId, notification.inviteId);
    } else if (notification.type === 'BOOK_LOG_INVITE') {
      handleAcceptBookLogInvitation(notification.inviteId);
    }
  };

  const handleRejectInvitation = (notification: Notification) => {
    if (notification.type === 'CLUB_INVITE' && notification.clubId) {
      handleRejectClubInvitation(notification.clubId, notification.inviteId);
    } else if (notification.type === 'BOOK_LOG_INVITE') {
      handleRejectBookLogInvitation(notification.inviteId);
    }
  };

  // 알림창 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      // "2025-03-09 07:38:47" 형식을 Date 객체로 변환
      const date = new Date(dateString.replace(' ', 'T'));
      return formatDistanceToNow(date, { addSuffix: true, locale: ko });
    } catch (err) {
      console.error('날짜 변환 오류:', err);
      return dateString;
    }
  };

  // 알림 아이템 렌더링 함수
  const renderNotificationItem = (notification: Notification) => {
    const isClubInvite = notification.type === 'CLUB_INVITE';

    return (
      <div key={notification.inviteId} className="p-6 border-b hover:bg-gray-50">
        <div className="flex justify-between gap-5">
          <div className="font-medium text-lg ">
            {isClubInvite ? notification.clubName : notification.bookName}
          </div>
          <div className="flex justify-center  items-center text-xs bg-gray-100 text-gray-600 w-32  rounded-full whitespace-pre">
            {isClubInvite ? '북클럽 초대' : '책 함께 읽기'}
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          <span className="font-medium">{notification.invitor}</span>님의 초대
        </div>
        <div className="text-xs text-gray-400 mt-1">{formatDate(notification.sendDateTime)}</div>
        <div className="mt-4 flex space-x-3">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
            onClick={() => handleAcceptInvitation(notification)}
          >
            수락
          </button>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
            onClick={() => handleRejectInvitation(notification)}
          >
            거부
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <motion.nav
        initial="hidden"
        animate="visible"
        className={`flex top-0 left-0 right-0 w-full justify-center px-16 z-50 transition-opacity duration-300 ${
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

          <div className="flex items-center justify-between w-[30rem] h-12 ml-32">
            {[
              { href: '/mylibrary', label: '내 서재' },
              { href: '/bookclubmain', label: '독서 모임' },
              { href: '/newbook', label: '신규 책 추가' },
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
            {/* 알림 버튼 */}
            <div className="relative" ref={notificationRef}>
              <motion.button
                className="text-gray-600 cursor-pointer p-2 relative"
                whileHover={{
                  scale: 1.1,
                  transition: { type: 'spring', stiffness: 400 },
                }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNotificationClick}
              >
                <Bell size={25} />
                {/* 알림 카운트 배지 */}
                {isLoggedIn && notifications.length > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {notifications.length}
                  </span>
                )}
                {/* 알림이 있을 때 표시할 빨간 점 */}
                {isLoggedIn && hasUnreadNotifications && (
                  <span className="absolute top-0 right-0 flex h-3 w-3 rounded-full bg-red-500"></span>
                )}
              </motion.button>

              {/* 알림 드롭다운 */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg  z-100 "
                    style={{
                      width: '500px', // 고정 픽셀 너비 사용
                      maxHeight: '500px',
                      overflowY: 'auto',
                    }}
                  >
                    <div className="py-3 px-6 bg-gray-50 border-b">
                      <h3 className="text-xl font-medium text-gray-800">알림</h3>
                    </div>

                    {isLoading ? (
                      <div className="p-6 text-center">
                        <div className="inline-block animate-spin h-8 w-8 border-t-2 border-b-2 border-green-700 rounded-full"></div>
                      </div>
                    ) : error ? (
                      <div className="p-6 text-red-500 text-center">로그인 해주세요</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">새로운 알림이 없습니다.</div>
                    ) : (
                      notifications.map((notification) => renderNotificationItem(notification))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 프로필 영역 - 클릭하면 로그인 페이지로 이동 */}
            <div onClick={handleProfileClick}>
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
                <span className="text-gray-700 font-medium ml-3">{nickname || '로그인'}</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.nav>

      {isDrawerOpen && <div className="fixed top-0 left-0 right-0 h-24 z-40" />}
    </>
  );
};

const HomePage: React.FC = () => {
  return (
    <>
      <div className="min-h-screen flex flex-col ">
        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1">
          {' '}
          {/* 히어로 섹션 */}
          <section className="relative h-[calc(100vh-4rem)]">
            <Navigation />
            <div className="fixed inset-0 z-0">
              <Image
                src="/background.svg"
                alt="Forest Background"
                fill
                priority
                quality={100}
                style={{ objectFit: 'cover' }}
              />
            </div>

            <div className="absolute inset-0  z-20 flex flex-col items-center justify-center text-center px-4">
              <p className="playfair-display-caption text-[#215B32] text-3xl tracking-normal mb-4">
                Together
              </p>
              <h1 className=" text-black text-4xl md:text-[2.375rem] font-bold mb-4 max-w-3xl whitespace-nowrap overflow-hidden">
                같이 읽는 즐거움, 더 오래 기억되는 이야기
              </h1>
              <p className="text-[#A3A3A3] text-xl font-semibold  mb-8">
                책으로 연결되는 순간, 독서 모임을 만들어보세요
              </p>

              <Link href="/bookclub" className="no-underline">
                <button className="flex items-center bg-[#215B32] hover:bg-[#194828] text-white px-6 py-3 rounded-full transition-colors">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  독서 모임 만들기
                </button>
              </Link>
            </div>
          </section>
          {/* 여기에 추가 콘텐츠 섹션을 넣을 수 있습니다 */}
        </main>
      </div>
    </>
  );
};

export default HomePage;
