'use strict';

module.exports = function (gulp, $, config) {
  gulp.task('browserSync', function () {
    if ($.yargs.argv.nobrowser) {
      config.openBrowser = false;
    }
    if ($.yargs.argv.open) {
      config.openBrowser = $.yargs.argv.open;
      config.openBrowser = (config.openBrowser === 'false') ? false : config.openBrowser;
    }
    $.browserSync({
      open: config.openBrowser,
      proxy: config.proxyHost + ':' + config.nodePort,
      port: config.syncPort,
      ghostMode: config.ghostMode
    });
  });

  gulp.task('watch', function () {
    $.browserSync.reload();
    gulp.watch([config.serverFiles, 'env.js'], ['build:server']);
    gulp.watch([
        config.appFiles
      ], ['build', $.browserSync.reload]);
  });
};

