// eslint-disable-next-line no-undef
module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['import', '@typescript-eslint'],
    root: true,
    rules: {
        "@typescript-eslint/no-parameter-properties": 0,
        "@typescript-eslint/no-inferrable-types": ["error", {"ignoreProperties":true}],
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
        'import/order': [
            'error',
            {
                groups: ['builtin', 'external', 'internal', 'parent', 'index', 'sibling']
            }
        ]
    }
}
