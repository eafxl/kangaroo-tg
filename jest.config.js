/* eslint-disable */
module.exports = {
    moduleFileExtensions: ['js', 'ts', 'json'],
    rootDir: '.',
    testRegex: '\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.json'
            }
        ]
    },
    coverageDirectory: './coverage/orm',
    testRunner: 'jest-circus/runner',
    setupFiles: ['jest-date-mock'],
    moduleNameMapper: {
        '^kangaroo-tg/test/(.*)$': '<rootDir>/test/$1'
    },
    reporters: [
        'default',
        [
            'jest-html-reporters',
            {
                publicPath: './test/reports',
                filename: 'report-unit.html',
                expand: true,
                openReport: false
            }
        ]
    ]
};
