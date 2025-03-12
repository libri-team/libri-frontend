'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface NavigationProps {
  isDrawerOpen?: boolean;
  nickname?: string | null;
}

interface Invitation {
  clubId: number;
  clubName: string;
  sendDateTime: string;
}

const Navigation = ({ isDrawerOpen }: NavigationProps) => {
  const pathname = usePathname();
  const [nickname, setNickname] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [, setIsAnimationReady] = useState(false);

  useEffect(() => {
    setIsAnimationReady(true);
  }, []);

  // 로컬 스토리지에서 정보 가져오기
  useEffect(() => {
    // 로컬 스토리지에서 회원 정보 가져오기
    const memberInfoString = localStorage.getItem('memberInfo');
    if (memberInfoString) {
      const memberInfo = JSON.parse(memberInfoString);
      setNickname(memberInfo.nickname);
    }
  }, []);

  // 토큰 가져오기 함수
  const getTokenFromStorage = (): string | null => {
    // 로컬 스토리지 검사
    console.log('로컬 스토리지 키 목록:', Object.keys(localStorage));

    // 로컬 스토리지에서 직접 액세스 토큰 찾기
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
        console.log(`토큰을 찾았습니다. 키: ${key}`);
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
          if (token) {
            console.log('memberInfo에서 토큰을 찾았습니다.');
          }
        } catch (e) {
          console.error('memberInfo 파싱 오류:', e);
        }
      }
    }

    return token;
  };

  // API에서 초대 정보 가져오기
  const fetchInvitations = async () => {
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

      // API 요청
      const response = await fetch('https://dev-api.libri.kr/club/invite', {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      console.log('받은 초대 데이터:', data);
      setInvitations(data);
    } catch (err: unknown) {
      console.error('초대 목록 가져오기 실패:', err);

      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';

      setError(errorMessage || '초대 정보를 불러오는데 실패했습니다');
    }
  };

  // 알림 아이콘 클릭 시 초대 정보 가져오기
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      fetchInvitations();
    }
  };

  // 초대 수락 처리
  const handleAcceptInvitation = async (clubId: number) => {
    try {
      const token = getTokenFromStorage();

      if (!token) {
        throw new Error('인증 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      }

      // PUT 메서드 사용 - curl 명령에 맞춤
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
      setInvitations(invitations.filter((inv) => inv.clubId !== clubId));
      alert('초대를 수락했습니다.');
    } catch (err: unknown) {
      console.error('초대 수락 실패:', err);

      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';

      alert(`초대 수락에 실패했습니다: ${errorMessage}`);
    }
  };

  // 초대 거부 처리
  const handleRejectInvitation = async (clubId: number) => {
    try {
      const token = getTokenFromStorage();

      if (!token) {
        throw new Error('인증 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      }

      // PUT 메서드 사용 - curl 명령에 맞춤
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
      setInvitations(invitations.filter((inv) => inv.clubId !== clubId));
      alert('초대를 거부했습니다.');
    } catch (err: unknown) {
      console.error('초대 거부 실패:', err);

      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';

      alert(`초대 거부에 실패했습니다: ${errorMessage}`);
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
              { href: '/bookclub', label: '독서 모임' },

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
                {invitations.length > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {invitations.length}
                  </span>
                )}
              </motion.button>

              {/* 알림 드롭다운 */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg overflow-visible z-50"
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
                      <div className="p-6 text-red-500 text-center">{error}</div>
                    ) : invitations.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">새로운 초대가 없습니다.</div>
                    ) : (
                      invitations.map((invitation) => (
                        <div key={invitation.clubId} className="p-6 border-b hover:bg-gray-50">
                          <div className="font-medium text-lg">{invitation.clubName}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatDate(invitation.sendDateTime)}
                          </div>
                          <div className="mt-4 flex space-x-3">
                            <button
                              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                              onClick={() => handleAcceptInvitation(invitation.clubId)}
                            >
                              수락
                            </button>
                            <button
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                              onClick={() => handleRejectInvitation(invitation.clubId)}
                            >
                              거부
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 프로필 영역 */}
            <Link className="no-underline" href={nickname ? '' : '/login'}>
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
            </Link>
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
            </div>
          </section>
          {/* 여기에 추가 콘텐츠 섹션을 넣을 수 있습니다 */}
        </main>
      </div>
    </>
  );
};

export default HomePage;
