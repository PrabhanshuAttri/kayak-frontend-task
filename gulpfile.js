'use strict';
const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const webpackStream = require('webpack-stream');

const baseDir = 'solution/';
const paths = {
  src: {
    js: `${baseDir}js/**/*.js`
  },
  dist: {
    js: `${baseDir}dist/js`
  }
}

gulp.task('default', () => {
  const options = {
    mode: "development"
  };
  return gulp.src(paths.src.js)
  .pipe(sourcemaps.init())
  .pipe(babel({
    presets: ['@babel/env']
  }))
  .pipe(webpackStream(options))
  .pipe(uglify())
  .pipe(concat('vanilla.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(paths.dist.js))
});