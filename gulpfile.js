const { src, watch } = require('gulp');
const eslint = require('gulp-eslint');

function lint() {
  return (
    src(['./src/**/*.js'])
      .pipe(eslint({ configFile: '.eslintrc.json' }))
      .pipe(eslint.format())
      .pipe(eslint.failAfterError())
  );
}

exports.lint = lint;
exports.watch = function () {
  watch('./src/**/*.js', lint);
};
