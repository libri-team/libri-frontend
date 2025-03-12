import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@radix-ui/react-dialog'],

  // 이미지 설정 추가
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.aladin.co.kr',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'libri-object-storage.kr.object.ncloudstorage.com',
        pathname: '**',
      },
    ],
  },

  // 빌드 시 린트 검사 비활성화
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 타입 체크 비활성화
  typescript: {
    ignoreBuildErrors: true,
  },

  // 프록시 설정 추가
  async rewrites() {
    return [
      {
        source: '/api/member/create/unique-id',
        destination: 'https://dev-api.libri.kr/member/create/unique-id',
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry 설정 (기존 설정 유지)
  org: 'minhan',
  project: 'javascript-nextjs',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
