module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/../tests/frontend.test.js'],
  collectCoverage: true,
  coverageDirectory: '../tests/coverage-frontend',
  coverageReporters: ['text', 'html'],
  verbose: true,
  transform: {
    '^.+\\.jsx?$': ['babel-jest', { configFile: '../babel.config.js' }]
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['<rootDir>/../tests/setupTests.js']
};
