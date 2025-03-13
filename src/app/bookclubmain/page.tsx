import type { NextPage } from 'next';
import Navigation from '@/components/Navigation';
import Carousel from '@/components/bookclubmain/Carousel';
import Testimonial from '@/components/bookclubmain/Testimonial';
import { BookClubCardProps } from '@/components/bookclubmain/BookClubCard';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

const Home: NextPage = () => {
  // Dummy data for book clubs
  const bookClubs: BookClubCardProps[] = [
    {
      imageUrl: '/book1.svg',
      title: '함께 읽는 즐거움',
      description: '고전 문학에 관한 모든 것',
      hostName: '손유림',
    },
    {
      imageUrl: '/book2.svg',
      title: '책 읽는 습관',
      description: '습관을 변화시키며 책읽기',
      hostName: '복규린',
    },
    {
      imageUrl: '/book3.svg',
      title: '독서 모임 이에요!',
      description: '서재가 필요하다면?',
      hostName: '하재민',
    },
    {
      imageUrl: '/book4.svg',
      title: '작은 독서 모임의 기적',
      description: '하루에 10페이지씩',
      hostName: '우정민',
    },
    {
      imageUrl: '/book5.svg',
      title: '우리는 독서가 아니에요',
      description: '이야기를 나누고 싶어요',
      hostName: '유승아',
    },
  ];

  const testimonials = [
    {
      quote: '"같이 읽으니 책이 다르게 보였어요!"',
      description: '혼자 읽을 땐 몰랐던 부분을 다른 분들이 짚어줘서 책이 더 깊게 느껴졌어요. ',
    },
    {
      quote: '"한 권의 책으로 확장되는 순간"',
      description:
        '각자의 경험과 생각이 더해지면서 한 권의 책이 수많은 이야기로 확장되는 느낌이었어요.',
    },
    {
      quote: '"나랑 정반대 의견을 듣고 신선한 충격!"',
      description: '같은 책인데 이렇게 다르게 느낄 수 있다니, 정말 흥미로웠어요!',
    },
  ];

  return (
    <div className="min-h-screen bg-[#EEF0ED]">
      <Navigation />

      <div
        className="absolute left-0 right-0 bottom-0 w-full z-0"
        style={{
          position: 'fixed',
          height: '80vh', // Increased from 60vh to 80vh
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1440 800"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <path
            d="M0 400 C 400 100, 1040 100, 1440 400 L 1440 800 L 0 800 Z" // Modified values to expand the curve height
            fill="white"
            fillOpacity="0.9"
          />
          <path
            d="M0 450 C 400 150, 1040 150, 1440 450 L 1440 800 L 0 800 Z" // Modified values to expand the curve height
            fill="white"
            fillOpacity="1"
          />
        </svg>
      </div>
      <main className="max-w-6xl mx-auto px-4 pt-10 mt-10 pb-16 z-10 relative">
        <div className="text-center mb-12">
          <p className="font-playfair text-2xl mb-3 text-[#215B32]">Book Club</p>
          <h1 className="text-3xl font-bold mb-2">
            함께 읽고, 함께 이야기하고, 더 오래 기억하세요
          </h1>
          <p className="text-[#868686] text-base mb-6 font-semibold">
            책모임 참여하면 습관도 책도 의견도 모두가 달라집니다.
          </p>

          <Link href="/addbookclub" className="flex justify-center mt-[2rem] no-underline z-20">
            <div className="flex justify-center items-center shrink-0 w-[18.5rem] h-16">
              <Button className="flex text-center w-full h-full px-4 py-2 rounded-[10rem] border-[#215B32] border-[2px] text-[#215B32] hover:bg-[#215B32] hover:text-[#ffffff] bg-[#ffffff] text-xl font-bold">
                <PlusCircle size={28} className="mr-2" /> 독서 모임 만들기
              </Button>
            </div>
          </Link>
        </div>

        <Carousel items={bookClubs} />

        <div className="mt-24 mb-16 text-center relative">
          <span className="font-playfair text-2xl mb-3 text-[#215B32]">Review</span>
          <h2 className="text-3xl font-bold mt-4 mb-8">
            당신만의 독서 경험을 나눌 시간! 지금 독서 모임에 참여해 보세요
          </h2>
          <p className="text-gray-400 text-lg mb-20 font-bold">
            누군가의 리뷰가 공감됐다면, 함께 이야기하며 더 깊이 읽어보세요
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
            {testimonials.map((testimonial, index) => (
              <Testimonial
                key={index}
                quote={testimonial.quote}
                description={testimonial.description}
              />
            ))}
          </div>
          <Link href="/bookclub" className="flex justify-center mt-[2rem] no-underline ">
            <button className="mt-12 border border-b-[#215B32] p-3 rounded-full text-lg font-bold text-[#215B32] hover:text-[#db8849] flex items-center mx-auto">
              <span>나의 독서 모임 열어보기</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="ml-1"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;
