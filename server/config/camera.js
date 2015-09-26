'use strict';

var path = require('path');

/**
 * Configuration options for the camera and motion program
 */

module.exports = {
  camera: {
    configPath: path.normalize(__dirname + '/../components/camera/motion.conf'),
    fps: 24,
    allowedRotate: [90, 180, 270],
    filename: 'frame',
    extra: {
      videodevice: '/dev/video0',
      target_dir: '/var/tmp/motion',
      rotate: 0,
      quality: 60,
      width: 320,
      height: 240,
      vfl2_palette: 8,
      auto_brightness: 'off',
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0
    }
  }
}