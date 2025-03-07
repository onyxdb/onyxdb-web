/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.module.rules.push({
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            use: ['@svgr/webpack'],
        });

        return config;
    },

    async rewrites() {
        return [
            {
                source: '/api/:path*', // Все запросы, начинающиеся с /api
                destination: 'http://localhost:9003/api/:path*', // Перенаправлять на бекенд
            },
        ];
    },
};

module.exports = nextConfig;
