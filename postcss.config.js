module.exports = {
  autoprefixer: {
    browsers: ['last 2 version', 'Firefox 15', 'iOS 8'],
  },
  // This is used by the webpack loader
  plugins: [require('autoprefixer')],
};
