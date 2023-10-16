const config = require('./jest.config');

module.exports = {
    ...config,
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '\\.e2e-spec.ts$',
    testTimeout: 300000,
    reporters: [
        'default',
        [
            'jest-html-reporters',
            {
                publicPath: './test/reports',
                filename: `report-e2e-${process.env.EPIC_ENV || 'local'}.html`,
                expand: true,
                openReport: false
            }
        ]
    ]
};
