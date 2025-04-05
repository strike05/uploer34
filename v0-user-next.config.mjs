/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['recharts'],
  images: {
    domains: ['firebasestorage.googleapis.com', 'example.com'],
  },
}

export default nextConfig

