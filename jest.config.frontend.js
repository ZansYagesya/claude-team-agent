module.exports = {
  testMatch: ['**/tests/frontend.test.js'],
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageDirectory: 'tests/coverage-frontend',
  coverageReporters: ['text', 'html'],
  verbose: true,
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^react-dom/client$': '<rootDir>/node_modules/react-dom/client',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js']
};
