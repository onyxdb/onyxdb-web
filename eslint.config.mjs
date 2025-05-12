import baseConfig from '@gravity-ui/eslint-config';
// import prettierConfig from '@gravity-ui/eslint-config/prettier';

export default [
    {
        ignores: ['.next/*', 'node_modules/*'],
    },
    ...baseConfig,
    // ...prettierConfig,
    {
        rules: {
            'no-console': 'off',
            // Настройки отступов
            'indent': ['error', 4, {
                'SwitchCase': 1,
                'ignoredNodes': ['PropertyDefinition'],
            }],

            // Для JSX отдельное правило
            // 'react/jsx-indent': ['error', 4],
            // 'react/jsx-indent-props': ['error', 4],

            // Если используете TypeScript
            // '@typescript-eslint/indent': ['error', 4]
        },
    },
];
