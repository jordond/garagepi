/**
 * Socket.io configuration
 */

'use strict';

var glob = require('glob');

var config = require('./index');
var log = require('../components/logger/console')('Socket');

var socketCount = 0;

module.exports = function (socketio) {
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  // ex: DEBUG: "http*,socket.io:socket"
  if (config.secureApi) {
    socketio.use(require('socketio-jwt').authorize({
      secret: config.secrets.session,
      handshake: true
    }));
  }

  socketio.on('connection', function (socket) {
    socket.connectedAt = new Date();
    socket.address = socket.handshake.address !== null ?
            socket.handshake.address : process.env.DOMAIN;
    socketCount++;

    socket.on('disconnect', function () {
      socketCount--;
      onDisconnect(socket);
    });

    onConnect(socket);
  });

  require('../components/camera/camera.socket').init(socketio);
};

/**
 * Private Helpers
 */

function onConnect(socket) {
  log.info('[' + socket.address + '][' + socket.id + '] Connected');
  log.debug('[' + socketCount + '] Sockets connected');

  socket.on('info', function (data) {
    var message = '[' + socket.id + '] Message: ' + JSON.stringify(data, null, 2);
    log.info(message);
  });

  // Find all of the api socket files and register them
  glob(config.api + '/**/*.socket.js', function (err, files) {
    if (err) { return log.error('Error finding socket files', err); }
    log.verbose('[' + socket.id + '] Registering [' + files.length + '] socket configs');
    files.forEach(function (file) {
      require(file).register(socket);
    });
  });
}

function onDisconnect(socket) {
  log.info('[' + socket.address + '][' + socket.id + '] Disconnected');
  log.verbose('[' + socketCount + '] Sockets remaining');
}
