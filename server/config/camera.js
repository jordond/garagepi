'use strict';

var path = require('path');

/**
 * Configuration options for the camera and motion program
 * Motion: http://www.lavrsen.dk/foswiki/bin/view/Motion/ConfigFileOptions
 * FSWebcam: http://manpages.ubuntu.com/manpages/lucid/man1/fswebcam.1.html
 */

module.exports = {
  camera: {
    configPath   : '/var/tmp/motion.conf',
    logPath      : path.normalize('/tmp'),
    fps          : 24,
    allowedRotate: [90, 180, 270],
    filename     : 'frame',
    shutdownDelay: 0,
    extra: {
      videodevice    : '/dev/video0',
      target_dir     : '/var/tmp/motion',
      rotate         : 0,
      quality        : 60,
      width          : 320,
      height         : 240,
      vfl2_palette   : 8,
      auto_brightness: 'off',
      brightness     : 0,
      contrast       : 0,
      saturation     : 0,
      hue            : 0
    }
  }
}