// @ts-check

/**
 * @type import('@jest/types').Config.InitialOptions
 */
const config = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['text'],
  roots: ['src'],
  transform: {
    '^.+\\.tsx?$': [
      'esbuild-jest',
      {
        sourcemap: true,
      },
    ],
  },
};

module.exports = config;
