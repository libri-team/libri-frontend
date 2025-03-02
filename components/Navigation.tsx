'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bell, Search, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface NavigationProps {
  isDrawerOpen?: boolean;
}

const Navigation = ({ isDrawerOpen }: NavigationProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();

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

  return (
    <>
      <motion.nav
        initial="hidden"
        animate="visible"
        className={`fixed top-0 left-0 right-0 w-full flex justify-center bg-white shadow-md px-16 z-50 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-40' : 'opacity-100'
        }`}
        style={{ padding: '1.5rem 4rem' }}
      >
        <div className="w-full max-w-screen-xl flex justify-between items-center z-50">
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
              <Image src="/logo.svg" width={120} height={40} alt="Libri" className="h-10 w-auto" />
            </Link>
          </motion.div>

          <div className="flex items-center justify-between space-x-10 h-12">
            {[
              { href: '/books/search', label: '책 검색', icon: <Search size={18} /> },
              { href: '/mylibrary', label: '내 서재', icon: null },
              { href: '/bookclub', label: '북클럽', icon: null },
              { href: '/newbook', label: '책 등록', icon: null },
            ].map((item) => (
              <motion.div
                key={item.href}
                className="relative h-full flex items-center"
                whileHover="hover"
              >
                <Link
                  href={item.href}
                  className={`
                    ${pathname === item.href ? 'text-emerald-700 font-bold' : 'text-gray-700 font-medium'}
                    text-base hover:text-emerald-600 no-underline 
                    transition-all duration-200 relative px-4 py-2 
                    flex items-center justify-center h-full
                    overflow-hidden
                  `}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  <motion.span
                    className="relative z-10"
                    variants={{
                      hover: {
                        y: -1,
                        transition: { duration: 0.2 },
                      },
                    }}
                  >
                    {item.label}
                  </motion.span>

                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
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
            <motion.button
              className="text-gray-600 cursor-pointer p-2 hover:bg-gray-100 rounded-full"
              whileHover={{
                scale: 1.1,
                transition: { type: 'spring', stiffness: 400 },
              }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={22} />
            </motion.button>

            {session?.user ? (
              <motion.div
                className="flex items-center gap-2 p-2 rounded-full cursor-pointer hover:bg-gray-100"
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    width={36}
                    height={36}
                    className="rounded-full"
                    alt="프로필"
                  />
                ) : (
                  <div className="bg-emerald-100 rounded-full p-2">
                    <User size={20} className="text-emerald-700" />
                  </div>
                )}
                <span className="text-gray-700 font-medium text-sm">
                  {session.user.name || session.user.email?.split('@')[0] || '사용자'}
                </span>
              </motion.div>
            ) : (
              <Link href="/auth/login" className="text-emerald-700 font-medium text-sm hover:text-emerald-800">
                로그인
              </Link>
            )}
          </motion.div>
        </div>
      </motion.nav>

      {isDrawerOpen && <div className="fixed top-0 left-0 right-0 h-24 z-40" />}
    </>
  );
};

export default Navigation;
