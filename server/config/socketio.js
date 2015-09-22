/**
 * Socket.io configuration
 */

'use strict';

var TAG = 'Socket';

var glob = require('glob');

var config = require('./index');
var log = require('../components/logger/console');

// When the user disconnects.. perform this
function onDisconnect(socket) {
}

// When the user connects.. perform this
function onConnect(socket) {
  // When the client emits 'info', this listens and executes
  socket.on('info', function (data) {
    var message = '[' + socket.address + '] ' + JSON.stringify(data, null, 2);
    log.info(TAG, message);
  });

  var pattern = config.api + '/**/*.socket.js';
  glob(pattern, function (err, files) {
    if (err) { return log.error(TAG, 'Error finding socket files', err); }
    log.info(TAG, 'Registering [' + files.length + '] socket configs');
    files.forEach(function (file) {
      require(file).register(socket);
    });
  });
}

module.exports = function (socketio) {
  // socket.io (v1.x.x) is powered by debug.
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  // dfdf
  // ex: DEBUG: "http*,socket.io:socket"
  socketio.use(require('socketio-jwt').authorize({
    secret: config.secrets.session,
    handshake: true
  }));

  socketio.on('connection', function (socket) {
    socket.address = socket.handshake.address !== null ?
            socket.handshake.address : process.env.DOMAIN;

    socket.connectedAt = new Date();

    // Call onDisconnect.
    socket.on('disconnect', function () {
      onDisconnect(socket);
      log.info(TAG, '[' + socket.address + '] DISCONNECTED');
    });

    // Call onConnect.
    onConnect(socket);
    log.info(TAG, '[' + socket.address + '] CONNECTED');
  });
};