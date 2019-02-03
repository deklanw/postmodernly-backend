module.exports = {
  extends: ['airbnb', 'plugin:prettier/recommended'],
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
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }]
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  }
};
