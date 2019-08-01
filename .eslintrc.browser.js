module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
    'plugin:vue/recommended'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    nodecg: 'readonly',
    NodeCG: 'readonly',
  },
  plugins: [
    'vue',
  ],
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'vue/html-self-closing': ['error', { html: { component: 'never' } }],
    'no-new': ['off'],
  },
};
