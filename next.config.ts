
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Solo ignorar errores en desarrollo, no en producción
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // Solo ignorar durante builds en desarrollo
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    buildActivity: false,
  },
  // Optimización para Vercel
  output: 'standalone',
};

export default nextConfig;
