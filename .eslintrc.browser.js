const path = require('path');

module.exports = {
    root: true,
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
    },
    env: {
        browser: true,
        es6: true,
    },
    extends: ['plugin:vue/essential', 'plugin:import/warnings', 'plugin:import/typescript', 'plugin:prettier/recommended'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
        nodecg: 'readonly',
        NodeCG: 'readonly',
    },
    plugins: ['vue', '@typescript-eslint', 'html', 'prettier'],
    rules: {
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        'no-new': ['off'],
        'class-methods-use-this': ['off'],
    },
};
