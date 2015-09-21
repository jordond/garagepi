'use strict'

var fs = require('fs')

module.exports = function(gulp, $, config) {
  var isProd = $.yargs.argv.env === 'prod';

  gulp.task('install:node', function () {
    return gulp.src(['./package.json'])
      .pipe($.install());
  });

  gulp.task('clean-server', function (cb) {
    return $.del([
      config.serverBuildDir,
      config.localEnvDest + '/' + config.localEnvFile
      ], cb);
  });

  // lint server files
  gulp.task('server-lint', ['clean-server'], function () {
    var jsFilter = $.filter('**/*.js');

    return gulp.src([
      config.serverFiles
    ])
      .pipe($.plumber({errorHandler: function (err) {
        $.notify.onError({
          title: 'Error linting at ' + err.plugin,
          subtitle: ' ', //overrides defaults
          message: err.message.replace(/\u001b\[.*?m/g, ''),
          sound: ' ' //overrides defaults
        })(err);

        this.emit('end');
      }}))
      .pipe(jsFilter)
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish'))
      .pipe($.jshint.reporter('fail'))
      .pipe(jsFilter.restore());
  });

  // copy server files to build directory
  gulp.task('server-copy', ['clean-server' ,'server-lint'], function () {
    return gulp.src([
      config.serverFiles
    ])
    .pipe(gulp.dest(config.serverBuildDir));
  });

  gulp.task('copy-config', ['clean-server', 'server-copy'], function () {
    if (fs.existsSync(config.localEnvFile)) {
      return gulp.src(config.localEnvFile)
        .pipe(gulp.dest(config.localEnvDest));
    } else {
      console.log('Local ENV.js file was not found, app will use unsafe defaults');
      return;
    }
  });

  // run the nodemon
  gulp.task('nodemon', ['clean-server', 'copy-config'], function (cb) {
    var called = false;
    if (!isProd) {
      config.nodemonOptions.nodeArgs = ['--debug'];
      config.nodemonOptions.env.NODE_ENV = 'development';
    } else {
      config.nodemonOptions.env.NODE_ENV = 'production';
    }
    return $.nodemon(config.nodemonOptions)
      .on('start', function onStart() {
        if (!called) {cb();}
        called = true;
      })
      .on('restart', function onRestart() {
        setTimeout(function reload() {
          $.browserSync.reload({stream: false});
        }, 1000);
      });
  });

  gulp.task('server', ['nodemon']);

  gulp.task('build:server', ['clean-server', 'copy-config']);
};