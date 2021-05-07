// @ts-check

/**
 * @type import('@jest/types').Config.InitialOptions
 */
module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['text'],
  roots: ['src'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'esbuild-jest',
      {
        sourcemap: true,
      },
    ],
  },
};
