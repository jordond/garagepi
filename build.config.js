'use strict';

var outDir = 'build/'

module.exports = {
  proxyHost: 'localhost',
  nodePort: 9001,
  syncPort: 3020,
  openBrowser: 'external',
  ghostMode: false,

  appName: 'app',

  localEnvFile: 'env.js',
  localEnvDest: outDir,

  // app directories
  appDir: 'client',
  serverDir: 'server',

  // build directories
  buildRoot: outDir,
  buildDir: outDir + 'client/',
  buildCss: outDir + 'client/css/',
  buildFonts: outDir + 'client/fonts/',
  buildImages: outDir + 'client/images/',
  buildJs: outDir + 'client/js/',
  buildJson: outDir + 'client/json/',
  extDir: outDir + 'client/vendor/',
  extCss: outDir + 'client/vendor/css/',
  extFonts: outDir + 'client/vendor/fonts/',
  extJs: outDir + 'client/vendor/js/',

  // server build directories
  serverBuildDir: outDir + 'server/',

  // deploy options
  root: 'garage-pi',
  hostname: 'merlin',
  username: 'pi',
  port: 22,
  destination: '/opt/garagepi',
  clean: true
};
