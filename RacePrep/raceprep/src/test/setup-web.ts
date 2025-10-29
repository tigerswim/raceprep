import '@testing-library/jest-dom';

// Mock expo-constants for web tests
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: 'mock-url',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'mock-key',
      EXPO_PUBLIC_API_BASE_URL: 'http://localhost:3001',
      EXPO_PUBLIC_ENVIRONMENT: 'test'
    }
  }
}));

// Mock expo-router for web tests
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// Silence console warnings during tests unless specifically testing them
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return;
    }
    originalConsoleWarn(...args);
  };

  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});