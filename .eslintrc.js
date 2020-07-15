module.exports = {
  env: {
    es6: true,
    browser: true,
  },
  ignorePatterns: ['/dist/*.*'],
  extends: ['airbnb-base'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    semi: ['error', 'never'],
    quotes: [2, 'single', {avoidEscape: true}],
    'no-console': 'off',
    'prefer-template': 'off',
    'consistent-return': 'off',
    'object-curly-spacing': ['error', 'never'],
    'no-param-reassign': 'off',
    'import/extensions': ['error', 'always'],
    'object-curly-newline': ['error', {
      ObjectExpression: {multiline: true},
      ObjectPattern: {multiline: true},
      ImportDeclaration: {multiline: true},
      ExportDeclaration: {multiline: true},
    }],
    'no-trailing-spaces': ['error', {skipBlankLines: true}],
  },
}
