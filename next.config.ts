
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
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({ handlebars: 'commonjs handlebars' })
      config.ignoreWarnings = config.ignoreWarnings || []
      config.ignoreWarnings.push(/require\.extensions is not supported by webpack/)
    }
    return config
  },
};

export default nextConfig;
