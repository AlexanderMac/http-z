module.exports = {
  testEnvironment: "node",
  testMatch: [
    "**/test/**/*.spec.ts"
  ],
  transform: {
    "^.+.ts$": ["ts-jest", {}],
  },
  modulePathIgnorePatterns: ['<rootDir>/docs', '<rootDir>/docs-src']
};