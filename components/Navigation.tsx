'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

interface NavigationProps {
  isDrawerOpen?: boolean;
}

const Navigation = ({ isDrawerOpen }: NavigationProps) => {
  const pathname = usePathname();

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
        className={`fixed top-0 left-0 right-0 w-full flex justify-center px-16 z-50 transition-opacity duration-300 ${
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

          <div className="flex items-center justify-between w-[28rem] h-12">
            {[
              { href: '/newbook', label: '신규 책 추가' },
              { href: '/bookclub', label: '독서 모임' },
              { href: '/mylibrary', label: '내 서재' },
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
            <motion.button
              className="text-gray-600 cursor-pointer p-2"
              whileHover={{
                scale: 1.1,
                transition: { type: 'spring', stiffness: 400 },
              }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={25} />
            </motion.button>

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
              <span className="text-gray-700 font-medium">Gyul_in11</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.nav>

      {isDrawerOpen && <div className="fixed top-0 left-0 right-0 h-24 z-40" />}
    </>
  );
};

export default Navigation;
