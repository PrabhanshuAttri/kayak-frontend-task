'use strict';
const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const webpackStream = require('webpack-stream');
const webp = require('gulp-webp');
const cleanCSS = require('gulp-clean-css');

const baseDir = 'solution/';
const paths = {
  src: {
    css: [`${baseDir}css/normalize.css`, `${baseDir}css/main.css`],
    js: `${baseDir}js/**/*.js`,
    images: `${baseDir}assets/images/*.{jpg,png}`
  },
  dist: {
    css: `${baseDir}dist/css`,
    js: `${baseDir}dist/js`,
    images: `${baseDir}dist/assets/images`,
  }
}

const images = () => gulp.src(paths.src.images)
.pipe(webp())
.pipe(gulp.dest(paths.dist.images));

const css = () => gulp.src(paths.src.css)
.pipe(sourcemaps.init())
.pipe(cleanCSS({compatibility: '*', level: {1: {specialComments: 0}}}))
.pipe(concat('styles.css'))
.pipe(sourcemaps.write())
.pipe(gulp.dest(paths.dist.css));

const js = () => {
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
};

const copyFiles = () => gulp.src([
  `${baseDir}assets/fonts/**/*`,
  `${baseDir}assets/icons/**/*`,
  `${baseDir}assets/**/*.svg`,
  `${baseDir}assets/**/*.json`,
  ]).pipe(gulp.dest(`${baseDir}dist/assets`));

const gulpDefault = () => gulp.parallel(images, css, js, copyFiles)

exports['heroku:production'] = gulpDefault();
exports.default = gulpDefault();