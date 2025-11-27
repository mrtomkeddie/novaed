
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Remove output: 'standalone' for Vercel deployment
  // output: 'standalone', // Only needed for Firebase Hosting
  
  // Remove these dangerous settings for production
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
