console.log('NEXT_PUBLIC_API_URL in config:', process.env.NEXT_PUBLIC_API_URL);
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  }
};
export default nextConfig;
