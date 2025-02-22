'use client';

import React, { useState } from 'react';
import { CirclePlus, Search, Calendar } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface drawerprops {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const BookSearchDrawer = ({ isOpen, setIsOpen }: drawerprops) => {
  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger className="hidden" />
      <DrawerContent className="flex items-center justify-center h-[65vh]">
        <div className="mx-auto w-full h-full max-w-5xl">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-[1.375rem] font-semibold">책 정보 검색</DrawerTitle>
            <DrawerDescription className="text-base font-medium text-gray-400">
              제목, 저자, 출판사, ISBN 등 정보로 검색 가능합니다.
            </DrawerDescription>
          </DrawerHeader>

          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              placeholder="책 정보 검색하기"
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          <div className="text-left">
            <p className="text-[1.25rem] font-semibold">규린님이 선호할 수도 있는 책</p>
          </div>
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">규린님이 선호할 수 있는 책이 없습니다.</p>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                닫기
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const NewBookPage = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`min-h-screen w-full bg-[#eef0ed] min-w-sm relative transition-all duration-300 ease-in-out flex flex-col ${
        isOpen ? 'scale-[0.98] rounded-xl overflow-hidden' : 'scale-100'
      }`}
    >
      <Navigation isDrawerOpen={isOpen} />
      <div className="absolute top-48 left-0 right-0 z-0 flex justify-center">
        <h1 className="font-playfair text-[17.5rem] font-normal leading-[22.75rem] text-[#183C23] opacity-15 whitespace-nowrap">
          My Library
        </h1>
      </div>

      <main className="relative z-10 pt-[11.75rem] flex flex-col flex-grow">
        <div className="relative text-center mb-[5.25rem]">
          <h2 className="text-[2.375rem] font-semibold text-gray-800">내 서재</h2>
          <p className="text-[1.125rem] text-[#737373]">읽고 싶은, 읽고 있는 또는 다 읽은 책을</p>
        </div>

        <div className="flex-grow flex flex-col  w-full items-center justify-center bg-white  px-[22.69rem] pt-[4.75rem]">
          <div className="flex items-center mb-[5.88rem] gap-10">
            {/* 왼쪽 컨텐츠 */}
            <div>
              <h3 className="text-xl  font-medium mb-4">책 정보</h3>

              <div className="flex w-[34.875rem] h-80 bg-[#F5F5F5] border-2 border-dashed border-[#A3A3A3] rounded-2xl p-6 items-center justify-center ">
                <Button
                  onClick={() => setIsOpen(true)}
                  variant="outline"
                  className="flex bg-white items-center justify-center w-[10rem] px-[0.75rem] py-[0.375rem] text-green-900 border-2 rounded border-[#215B32] hover:bg-green-50"
                >
                  <div className="flex  items-center gap-2 ">
                    <span className="flex-grow text-center text-base">책 정보 검색하기</span>
                    <CirclePlus className="w-5 h-5" />
                  </div>
                </Button>
              </div>
              <BookSearchDrawer isOpen={isOpen} setIsOpen={setIsOpen} />
            </div>

            {/* 오른쪽 컨텐츠 */}
            <div className="w-[37.25rem] h-80">
              <div>
                <h3 className="text-lg font-medium ">평점</h3>
                <div className="space-y-6"></div>
                <h3 className="text-lg font-medium ">상태</h3>
                <div className="space-y-6">
                  <div>
                    <Select>
                      <SelectTrigger className="w-72 border-2 rounded">
                        <SelectValue placeholder="상태 선택하기" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reading">읽는 중</SelectItem>
                        <SelectItem value="completed">완독</SelectItem>
                        <SelectItem value="wishlist">읽고 싶은 책</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex w-full">
                  <div className="mr-5">
                    <h3 className="text-lg font-medium ">시작일</h3>
                    <div className="flex w-72 h-12 items-center border border-gray-200 rounded-lg p-2">
                      <Calendar className="h-6 w-6 text-gray-400" />
                      <Input type="text" placeholder="YYYY.MM.DD 00:00" className=""></Input>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium ">마감일</h3>
                    <div className="flex w-72 h-12 items-center border border-gray-200 rounded-lg p-2">
                      <Calendar className="h-6 w-6 text-gray-400" />
                      <Input type="text" placeholder="YYYY.MM.DD 00:00" className=""></Input>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/*  아래 생성하기  */}
          <div className="flex justify-center items-center shrink-0 w-[18.5rem] h-16">
            <Button className="flex text-center w-full h-full px-4 py-2 rounded-[10rem] bg-[#215B32] hover:bg-green-700 text-white text-xl font-normal">
              생성하기
            </Button>
          </div>
        </div>
      </main>

      {/* Overlay for drawer */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
    </div>
  );
};

export default NewBookPage;
