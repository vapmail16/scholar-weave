// Global test setup
beforeAll(async () => {
  // Setup test environment
  process.env['NODE_ENV'] = 'test';
});

// Global test teardown
afterAll(async () => {
  // Cleanup test environment
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Increase timeout for database operations
jest.setTimeout(30000); 