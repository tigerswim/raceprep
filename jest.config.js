module.exports = {
  projects: [
    {
      displayName: 'react-native',
      preset: 'react-native',
      testMatch: ['<rootDir>/src/components/__tests__/simple.test.tsx', '<rootDir>/src/components/__tests__/Training.test.tsx', '<rootDir>/src/components/__tests__/ErrorBoundary.test.tsx', '<rootDir>/src/services/__tests__/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/src/test/setup-native.ts'],
      transformIgnorePatterns: [
        'node_modules/(?!(jest-)?react-native|@react-native|@expo|expo|@unimodules|unimodules|sentry-expo|native-base|react-clone-referenced-element|react-redux|@reduxjs)'
      ],
    },
    {
      displayName: 'web',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/components/__tests__/AuthModal.test.tsx'],
      setupFilesAfterEnv: ['<rootDir>/src/test/setup-web.ts'],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
      },
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          tsconfig: {
            jsx: 'react-jsx'
          }
        }]
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    }
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.expo/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!**/node_modules/**',
    '!**/.expo/**'
  ],
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ]
};