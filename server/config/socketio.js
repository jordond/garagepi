/**
 * Socket.io configuration
 */

'use strict';

var glob = require('glob');

var config = require('./index');
var log = require('../components/logger/console')('Socket');

var sockets = {};

function onDisconnect(socket) {
}

function onConnect(socket) {
  sockets[socket.id] = socket;
  socket.on('info', function (data) {
    var message = '[' + socket.address + '] ' + JSON.stringify(data, null, 2);
    log.info(message);
  });

  // Find all of the api socket files and register them
  glob(config.api + '/**/*.socket.js', function (err, files) {
    if (err) { return log.error('Error finding socket files', err); }
    log.info('Registering [' + files.length + '] socket configs');
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
      log.info('[' + socket.address + '] DISCONNECTED');
    });

    // Call onConnect.
    onConnect(socket);
    log.info('[' + socket.address + '] CONNECTED');
  });
};