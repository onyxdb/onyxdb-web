// eslint-disable-next-line no-undef
const path = require('path');

// Базовый конфиг
const nextConfig = {
    // serverExternalPackages: ['@gravity-ui/uikit'],
    compiler: {
        styledComponents: true,
    },
    webpack: (config) => {
        config.module.rules.push({
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            use: ['@svgr/webpack'],
        });

        // eslint-disable-next-line no-param-reassign
        config.resolve.alias = {
            ...config.resolve.alias,
            // eslint-disable-next-line no-undef
            '@': path.resolve(__dirname, 'src'),
        };

        return config;
    },

    async rewrites() {
        // ENV BACKEND_URL=http://localhost:9001
        // ENV BACKEND_URL=http://host.docker.internal:9001
        // ENV BACKEND_URL=http://onyxdb:9001

        // eslint-disable-next-line no-undef
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:9001';
        // eslint-disable-next-line no-undef
        const grafanaUrl = process.env.GRAFANA_URL || 'http://localhost:3333';

        console.log('backendUrl', backendUrl)
        console.log('grafanaUrl', grafanaUrl)
        return [
            {
                source: '/idm/api/:path*', // Все запросы, начинающиеся с /idm/api
                destination: `${backendUrl}/api/:path*`, // Перенаправлять на бекенд
            },
            {
                source: '/mdb/api/:path*', // Все запросы, начинающиеся с /mdb/api
                destination: `${backendUrl}/api/:path*`, // Перенаправлять на бекенд
            },
            {
                source: '/grafana/:path*', // Все запросы, начинающиеся с /grafana
                destination: `${grafanaUrl}/:path*`, // Перенаправлять на Grafana
            },
        ];
    },
};

// eslint-disable-next-line no-undef
module.exports = nextConfig;
