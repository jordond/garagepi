/**
 * Socket.io configuration
 */

'use strict';

var glob = require('glob');

var config = require('./index');
var log = require('../components/logger/console')('Socket');
var camera = require('../components/camera');

module.exports = function (socketio) {
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  // ex: DEBUG: "http*,socket.io:socket"
  if (config.secureApi) {
    socketio.use(require('socketio-jwt').authorize({
      secret: config.secrets.session,
      handshake: true
    }));
  }

  camera.init();

  socketio.on('connection', function (socket) {
    socket.connectedAt = new Date();
    socket.address = socket.handshake.address !== null ?
            socket.handshake.address : process.env.DOMAIN;

    socket.on('disconnect', function () {
      onDisconnect(socket);
    });

    onConnect(socket);
  });
};

/**
 * Private Helpers
 */

function onConnect(socket) {
  log.info('[' + socket.address + '] CONNECTED');

  socket.on('info', function (data) {
    var message = '[' + socket.id + '] Message: ' + JSON.stringify(data, null, 2);
    log.info(message);
  });

  // Find all of the api socket files and register them
  glob(config.api + '/**/*.socket.js', function (err, files) {
    if (err) { return log.error('Error finding socket files', err); }
    log.info('[' + socket.id + '] Message: Registering [' + files.length + '] socket configs');
    files.forEach(function (file) {
      require(file).register(socket);
    });
    camera.register(socket);
  });
}

function onDisconnect(socket) {
  log.info('[' + socket.address + '] DISCONNECTED');
  camera.unregister(socket);
}
