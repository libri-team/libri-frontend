'use client';
import React from 'react';
import Naver from '@/components/NaverLogin';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Book, Search, Users } from 'lucide-react';

export default function Home() {
  const { status } = useSession();
  
  const isAuthenticated = status === 'authenticated';

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen">
      {!isAuthenticated ? (
        <section className="flex flex-col md:flex-row items-center gap-12 py-16">
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              당신만의<br/><span className="text-emerald-600">독서 여정</span>을<br/>시작하세요
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Libri와 함께 책을 기록하고, 감상을 나누고,<br/>독서의 즐거움을 발견하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Naver />
              <Link href="/books/search" className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center gap-2 transition-colors">
                둘러보기 <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex-1 relative h-[400px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Image 
              src="/hero-image.jpg" 
              alt="책을 읽는 모습"
              fill
              className="object-cover rounded-lg shadow-lg"
            />
          </motion.div>
        </section>
      ) : (
        <section className="py-12">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={item} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Book className="text-emerald-600" size={24} />
              </div>
              <h2 className="text-xl font-bold mb-2">내 서재</h2>
              <p className="text-gray-600 mb-6">나만의 책 컬렉션을 관리하고 독서 기록을 남겨보세요.</p>
              <Link href="/mylibrary" className="text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700">
                바로가기 <ArrowRight size={16} />
              </Link>
            </motion.div>
            
            <motion.div variants={item} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="text-emerald-600" size={24} />
              </div>
              <h2 className="text-xl font-bold mb-2">책 검색</h2>
              <p className="text-gray-600 mb-6">다양한 책을 검색하고 나의 서재에 추가해보세요.</p>
              <Link href="/books/search" className="text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700">
                바로가기 <ArrowRight size={16} />
              </Link>
            </motion.div>
            
            <motion.div variants={item} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-emerald-600" size={24} />
              </div>
              <h2 className="text-xl font-bold mb-2">북클럽</h2>
              <p className="text-gray-600 mb-6">다른 독자들과 함께 책에 대한 생각을 나누고 소통하세요.</p>
              <Link href="/bookclub" className="text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700">
                바로가기 <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </section>
      )}
    </div>
  );
}
