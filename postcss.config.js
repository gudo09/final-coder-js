// postcss.config.js
module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    cssnano: {},
    'postcss-preset-env': { 
      stage: 3, 
      features: {
      "nesting-rules": true,
      }
    },
  }
}