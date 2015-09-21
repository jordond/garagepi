'use strict';

var _ = require('lodash')
  , buildConfig = require('./build.config')
  , config = {}
  , fs = require('fs')
  , gulp = require('gulp')
  , gulpFiles = require('require-dir')('./gulp-files')
  , path = require('path')
  , $, key;

$ = require('gulp-load-plugins')({
  pattern: [
  'browser-sync',
  'del',
  'gulp-*',
  'main-bower-files',
  'multi-glob',
  'nodemon',
  'plato',
  'run-sequence',
  'streamqueue',
  'uglify-save-license',
  'wiredep',
  'yargs'
  ]
});

_.merge(config, buildConfig);

config.appFiles = path.join(config.appDir, '**/*');
config.appFontFiles = path.join(config.appDir, 'fonts/**/*');
config.appImageFiles = path.join(config.appDir, 'images/**/*');
config.appMarkupFiles = path.join(config.appDir, '**/*.html');
config.appScriptFiles = path.join(config.appDir, '**/*.js');
config.appStyleFiles = path.join(config.appDir, '**/*.{css,less}');
config.appJsonFiles = path.join(config.appDir, '**/*.json');

config.buildDirectiveTemplateFiles = path.join(config.buildDir, '**/*directive.tpl.html');
config.buildJsFiles = path.join(config.buildJs, '**/*.js');

config.serverMain = path.join(config.serverBuildDir, 'app.js');
config.serverFiles = path.join(config.serverDir, '**/*.{js,html}');

if (fs.existsSync(config.localEnvFile)) {
  var env = require('./' + config.localEnvFile);
  config.nodePort = env.port ? env.port : config.nodePort;
}

config.nodemonOptions = {
  script: config.serverMain,
  watch: config.serverBuildDir,
  env: {'PORT': config.nodePort}
}

for (key in gulpFiles) {
  gulpFiles[key](gulp, $, config);
}

gulp.task('install', function (cb) {
  $.runSequence(['install:bower', 'install:node'], cb);
});

gulp.task('dev', ['server', 'build:client'], function () {
  gulp.start('browserSync');
  gulp.start('watch');
});

gulp.task('build', function () {
  gulp.start('build:server');
  gulp.start('build:client');
});

gulp.task('default', ['dev']);
