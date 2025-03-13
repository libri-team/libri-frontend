'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-4 rounded-xl bg-white', className)}
      classNames={{
        // 월 컨테이너 스타일 조정 (가로 정렬, 간격 균등)
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center',

        // 개별 월 스타일
        month: 'space-y-4 w-full', // 내부 간격 조정

        // 캡션(월 타이틀) 영역
        caption: 'flex justify-center pb-4 pt-2 relative items-center',
        caption_label: 'text-lg font-medium px-6',

        // 네비게이션 버튼 스타일
        nav: 'space-x-1 flex items-center absolute w-full justify-between left-0 right-0 px-1',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-8 w-8 bg-white border border-gray-200 flex items-center justify-center p-0 hover:bg-gray-50 hover:opacity-100',
        ),
        nav_button_previous: 'left-1',
        nav_button_next: 'right-1',

        // 테이블 레이아웃 개선
        table: 'w-full border-collapse space-y-2',

        // 요일 헤더 행 스타일
        head_row: 'flex justify-between mb-2',
        head_cell: 'text-gray-500 rounded-md w-10 font-medium text-sm text-center flex-1',

        // 날짜 행 스타일
        row: 'flex justify-between w-full mt-2',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md',
        ),

        // 개별 날짜 버튼 스타일
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-8 w-8 p-0 font-normal aria-selected:opacity-100 mx-auto', // 가운데 정렬 추가
        ),
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',

        // 선택된 날짜 스타일
        day_selected:
          'bg-[#215B32] text-white hover:bg-[#215B32] hover:text-white focus:bg-[#215B32] focus:text-white',

        // 오늘 날짜 스타일
        day_today: 'border-2 border-[#215B32] font-semibold text-[#215B32] rounded-md',

        // 외부 날짜 스타일
        day_outside:
          'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',

        // 비활성화된 날짜 스타일
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn('h-4 w-4', className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn('h-4 w-4', className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
