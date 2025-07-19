
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Firebase Hosting
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // This is required for Genkit to work correctly.
    esmExternals: 'loose',
  },
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
    // Exclude specific server-only modules from the client bundle to prevent build errors.
    if (!isServer) {
      config.externals = [
        ...(config.externals || []),
        'firebase-admin',
      ];
    }
    return config;
  },
};

export default nextConfig;
