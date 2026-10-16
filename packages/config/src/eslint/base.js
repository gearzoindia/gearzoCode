/**
 * Base ESLint configuration for GearZo workspace packages and applications.
 */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    // Disallow cross-API imports between isolated backend APIs
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/apps/customer-api/**', '**/apps/mechanic-api/**', '**/apps/admin-api/**'],
            message: 'Direct cross-API imports are prohibited. Use shared packages or HTTP/Event interfaces.',
          },
        ],
      },
    ],
  },
  env: {
    node: true,
    es2022: true,
  },
  ignorePatterns: ['dist', 'node_modules', '.turbo', '*.config.js'],
};
