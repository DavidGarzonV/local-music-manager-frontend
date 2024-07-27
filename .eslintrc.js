module.exports = {
  extends: 'erb',
  plugins: ['@typescript-eslint'],
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-import-module-exports': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-unused-vars': 'warn',
    'react/require-default-props': 'off',
    'no-console': 1,
    'react/jsx-props-no-spreading': 'off',
    'react/no-unstable-nested-components': 'off',
    'no-plusplus': 'off',
    'import/prefer-default-export': 'warn',
    'jsx-a11y/label-has-associated-control': 'off',
    'promise/no-nesting': 'off',
    'import/no-dynamic-require': 'off',
    semi: 1,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
      },
      typescript: {},
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
