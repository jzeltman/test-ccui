module.exports = {
  plugins: {
    'postcss-easy-import': { prefix: '_' },
    'postcss-nested': {},
    'postcss-at-rules-variables': {},
    'tailwindcss': {},
    // 'postcss-ccui-tailwind': { tailwindConfig: './tailwind.config.js', },
    autoprefixer: {},
    cssnano: {},
  }
};