
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Vercel deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    esmExternals: 'loose', // Allows handling of Genkit & OpenTelemetry dependencies
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
    // Prevent Vercel build errors from server-only modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    // Exclude problematic server-only modules from the client bundle
    if (!isServer) {
      config.externals = [
        ...(config.externals || []),
        '@opentelemetry/exporter-jaeger',
        '@genkit-ai/firebase',
        'firebase-admin',
      ];
    }

    return config;
  },
};

export default nextConfig;
