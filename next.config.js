/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
  },
  async headers() {
    return [
      {
        // Aplicar estos headers a todas las rutas
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=self'
          },
          {
            key: 'Feature-Policy',
            value: 'camera self'
          }
        ]
      }
    ]
  },
  images: {
    unoptimized: true,
    domains: ['eventechy.com', 'invitacion-v2.eventechy.com'],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
      child_process: false,
    };
    if (isServer) {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
        'http2': 'commonjs http2'
      })
    }
    return config;
  },
  headers: async () => {
    return [
      {
        source: '/scanner',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=self'
          },
          {
            key: 'Feature-Policy',
            value: 'camera self'
          }
        ],
      },
      {
        source: '/auth-project',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=self'
          },
          {
            key: 'Feature-Policy',
            value: 'camera self'
          }
        ],
      }
    ]
  },
};

module.exports = nextConfig; 