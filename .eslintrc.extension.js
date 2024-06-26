const path = require('path');

module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: path.join(__dirname, 'tsconfig.extension.json'),
    },
    plugins: ['@typescript-eslint', 'prettier'],
    extends: ['plugin:@typescript-eslint/recommended', 'plugin:import/warnings', 'plugin:import/typescript', 'prettier'],
    rules: {
        'prettier/prettier': 2,
        '@typescript-eslint/indent': ['error', 4],
        '@typescript-eslint/ban-ts-comment': ['warn'],
    },
};
