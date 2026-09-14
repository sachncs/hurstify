const isProdExport = process.env.BUILD_FOR_PAGES === '1';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/hurstify';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: isProdExport ? 'export' : undefined,
  basePath,
  trailingSlash: isProdExport,
  images: {
    unoptimized: isProdExport,
  },
};

export default nextConfig;
