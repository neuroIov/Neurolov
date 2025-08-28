/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['canvas', 'jsdom']
  },
  // Fix for Windows OneDrive symlink issues
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer, dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    config.resolve.extensions = [...config.resolve.extensions, '.js', '.jsx'];
    config.module.rules.push({
      test: /\.(js|jsx)$/,
      include: [/three\/examples\/jsm/],
      type: 'javascript/auto'
    });
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false
    };

    // Remove console statements in production
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        minimizer: [
          ...config.optimization.minimizer,
        ],
      };
      
      // Add Terser plugin to remove console statements
      const TerserPlugin = require('terser-webpack-plugin');
      config.optimization.minimizer.push(
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          },
        })
      );
    }
    
    return config;
  },
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'header',
            key: 'host',
            value: 'main--neurolov-compute.netlify.app',
          },
        ],
        destination: 'https://app.neurolov.ai',
        permanent: true,
      },
    ]
  }
}

module.exports = nextConfig
