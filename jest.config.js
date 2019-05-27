const ignorePatterns = ["<rootDir>/dist/", "<rootDir>/node_modules/", "<rootDir>/test-helper/"];

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  coveragePathIgnorePatterns: ignorePatterns,
  testPathIgnorePatterns: ignorePatterns,
};
