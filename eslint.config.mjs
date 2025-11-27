import nextConfig from 'eslint-config-next'

export default [
  ...nextConfig,
  {
    ignores: ['node_modules/**', '.next/**', 'vercel/**'],
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-img-element': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/purity': 'off'
    }
  }
]
