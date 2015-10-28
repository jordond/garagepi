'use strict';

module.exports = function (gulp, $, config) {
  var options = {
    root: config.buildRoot,
    hostname: config.hostname,
    username: config.username,
    destination: config.destination,
    port: config.port,
    emptyDirectories: true,
    clean: config.clean,
    recursive: config.clean,
    exclude: ['env.js', 'tsd.json'],
    compress: true
  };

  gulp.task('deploy', ['build:server', 'build:client'], function () {
    return deploy();
  });

  gulp.task('deploy:server', ['build:server'], function () {
    return deploy();
  });

  gulp.task('deploy:client', ['build:client'], function () {
    return deploy();
  });

  function deploy() {
    return gulp.src([config.buildRoot + '**/*']).pipe($.rsync(options));
  }
};
