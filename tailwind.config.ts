import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      playfair: ['"Playfair Display"', 'serif'],
    },
    extend: {
      colors: {
        // 원래 있던 컬러 정의가 있으면 여기에 추가
      },
    },
  },
  plugins: [daisyui],
} satisfies Config;
