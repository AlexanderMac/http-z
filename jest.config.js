module.exports = {
  testEnvironment: "node",
  testMatch: [
    "**/test/**/*.ts"
  ],
  transform: {
    "^.+.ts$": ["ts-jest", {}],
  },
  modulePathIgnorePatterns: ['<rootDir>/demo']
};