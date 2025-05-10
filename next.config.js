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
                source: '/idm/api/:path*', // Все запросы, начинающиеся с /idm/api
                destination: 'http://localhost:9001/api/:path*', // Перенаправлять на бекенд
            },
            {
                source: '/mdb/api/:path*', // Все запросы, начинающиеся с /mdb/api
                destination: 'http://localhost:9001/api/:path*', // Перенаправлять на бекенд
            },
        ];
    },
};

module.exports = nextConfig;
