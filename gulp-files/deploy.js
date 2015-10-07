'use strict';

module.exports = function (gulp, $, config) {
  gulp.task('deploy', ['build:server', 'build:client'], function () {
    var options = {
      root: config.buildRoot,
      hostname: config.hostname,
      username: config.username,
      destination: config.destination,
      port: config.port,
      emptyDirectories: true,
      clean: config.clean,
      recursive: config.clean,
      exclude: 'env.js',
      compress: true
    };
    return gulp.src([config.buildRoot + '**/*'])
    .pipe($.rsync(options));
  });
};
