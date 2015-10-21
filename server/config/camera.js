'use strict';

var path = require('path');

/**
 * Configuration options for the camera and motion program
 * Motion: http://www.lavrsen.dk/foswiki/bin/view/Motion/ConfigFileOptions
 * FSWebcam: http://manpages.ubuntu.com/manpages/lucid/man1/fswebcam.1.html
 *
 * configPath   : Directory to write the config file for motion
 * logPath      : Directory to write motion log files
 * devicePolling: Time in seconds to check if the videodevice exists
 * fps          : Speed in seconds to check for a new frame capture
 * allowedRotate: Allowed roation values in degrees
 * filename     : Name to save the captured frames as * .jpg is added on
 * shutdownDelay: Time in minutes to wait before stopping motion capture
 * scale        : Height and width to scale the frame from * only used by FSWebcam
 * extra        : Extra motion config, videodevice used by camera module
 *                Check motion's documentation for more info
 */

module.exports = {
  camera: {
    configPath   : '/var/tmp/motion.conf',
    logPath      : path.normalize('/tmp'),
    devicePolling: 60,
    fps          : 24,
    allowedRotate: [90, 180, 270],
    filename     : 'frame',
    shutdownDelay: 1,
    scale: {
      w: 1280,
      h: 720
    },
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
};