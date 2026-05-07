module.exports = {
  testMatch: ['**/tests/backend.test.js'],
  collectCoverage: true,
  coverageDirectory: 'tests/coverage-backend',
  coverageReporters: ['text', 'html'],
  verbose: true
};
