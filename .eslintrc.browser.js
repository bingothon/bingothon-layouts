const path = require('path')

module.exports = {
    root: true,
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        project: path.join(__dirname, 'tsconfig.browser.json'),
    },
    env: {
        browser: true,
        es6: true,
    },
    extends: [
        'plugin:vue/essential',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'plugin:prettier/recommended',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
        nodecg: 'readonly',
        NodeCG: 'readonly',
    },
    plugins: ['vue', '@typescript-eslint', 'html'],
    rules: {
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        'vue/html-self-closing': ['error', { html: { component: 'never' } }],
        'no-new': ['off'],
        'class-methods-use-this': ['off'],
    },
}
