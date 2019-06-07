module.exports = {
  extends: [
    'airbnb',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended'
  ],
  env: {
    jest: true
  },
  parser: '@typescript-eslint/parser',
  rules: {
    'react/jsx-filename-extension': 0,
    'import/prefer-default-export': 0,
    'class-methods-use-this': 0,
    'no-unused-vars': 0,
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'prefer-template': 0,
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'lines-between-class-members': 0,
    'no-console': 0,
    'no-useless-constructor': 0,
    'no-empty-function': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-member-accessibility': 0,
    '@typescript-eslint/no-parameter-properties': 0,
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-interface': 'warn',
    'no-await-in-loop': 'warn',
    'no-loop-func': 'warn',
    radix: 0
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  }
};
