import pluginVue from 'eslint-plugin-vue';
import pluginImport from 'eslint-plugin-import';
import vueParser from 'vue-eslint-parser';

const browserGlobals = {
  console: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  localStorage: 'readonly',
  document: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  FileReader: 'readonly',
  window: 'readonly',
};

export default [
  {
    plugins: {
      import: pluginImport,
    },
    languageOptions: {
      globals: {
        ...browserGlobals,
      },
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
      'import/no-unresolved': 'off',
    },
  },
  {
    files: ['**/*.vue'],
    plugins: {
      vue: pluginVue,
    },
    languageOptions: {
      parser: vueParser,
      globals: browserGlobals,
    },
    rules: {
      ...pluginVue.configs['recommended'].rules,
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: browserGlobals,
    },
  },
];