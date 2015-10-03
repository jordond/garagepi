(function () {
  'use strict';

  /**
   * @ngdoc factory
   * @name ui.camera.service:Feed
   *
   * @description
   *
   */
  angular
    .module('ui.camera')
    .factory('Feed', FeedConfig);

  /** @ngInject */
  function FeedConfig($q, $interval, $timeout, Socket, logger) {
    var TAG = 'Feed'
      , service
      , data
      , reconnectTimeout
      , motionTimer;

    data = {
      started: false,
      info: {},
      streaming: false,
      loading: false,
      motion: false,
      frame: {},
      error: {
        hasError: false,
        message: ''
      }
    };

    service = {
      activate: activate,
      toggle  : toggle,
      stop    : stop,
      data    : data
    };

    return service;

    /**
     * Public Methods
     */

    function activate(autostart) {
      return getInfo()
        .then(function (info) {
          data.info = info;
          if (info.ready) {
            if (!info.isCapturing && autostart) {
              start();
            }
          } else {
            logger.log(TAG, 'Camera feed not available Error: ' + info.error);
            data.error.hasError = true;
            data.error.message = info.error;
          }
        })
        .catch(function (err) {
          logger.log(TAG, 'Activate failed: ' + err);
        });
    }

    function toggle() {
      if (!data.started) {
        start();
      } else if (data.streaming) {
        logger.log(TAG, 'Pausing the camera feed');
        unregisterEvents();
        data.streaming = false;
      } else {
        logger.log(TAG, 'Resuming the camera feed');
        registerEvents();
        data.streaming = true;
      }
    }

    function stop() {
      if (data.started) {
        Socket.emit('camera:stop');
        if (angular.isDefined(motionTimer)) {
          logger.log(TAG, 'Stopping motion active checker');
          $interval.cancel(motionTimer);
          motionTimer = undefined;
        }
      }
    }

    function resetData() {
      data.started = false;
      data.info = {};
      data.streaming = false;
      data.loading = false;
      data.motion = false;
      data.frame = {};
      data.error.hasError = false;
    }

    /**
     * Private functions
     */

    function getInfo() {
      var q = $q.defer();
      Socket.emit('camera:info', null, function (info) {
        logger.log(TAG, 'Recieved camera information from the server');
        q.resolve(info);
      });
      return q.promise;
    }

    function start() {
      registerEvents();
      Socket.emit('camera:start');
      motionTimer = $interval(checkMotion, 3000);
      data.streaming = true;
      data.started = true;
    }

    function registerEvents() {
      logger.log(TAG, 'Registering camera events');
      Socket.on('disconnect', onDisconnect);
      Socket.on('reconnect', onReconnect);

      Socket.on('camera:loading', function () {
        logger.log(TAG, 'Camera feed is loading');
        data.loading = true;
      });
      Socket.on('camera:initial', function (frame) {
        logger.log(TAG, 'Recieved initial frame');
        data.frame = {
          timestamp: Date.now(),
          src: 'data:image/jpeg;base64, ' + frame,
          prev: 'data:image/jpeg;base64, ' + frame
        }
        $timeout(function () {
          data.loading = false;
        }, 30 * 1000);
      });
      Socket.on('camera:frame', function (frame) {
        data.loading = false;
        data.motion = true;
        data.frame = {
          timestamp: Date.now(),
          src: 'data:image/jpeg;base64, ' + frame
        };
        data.frame.prev = data.frame.src;
      });

      function onDisconnect() {
        resetData();
        data.error = {
          hasError: true,
          message: 'Connection to server has been lost'
        };
        reconnectTimeout = null;
        stop();
        unregisterEvents();
        Socket.remove('disconnect', onDisconnect);
      }

      function onReconnect() {
        if (!reconnectTimeout) {
          reconnectTimeout = $timeout(reconnect, 2000);
          Socket.remove('reconnect', onReconnect);
        }
      }
    }

    function reconnect() {
      logger.log(TAG, 'Attempting to reactivate camera feed');
      reconnectTimeout = null;
      resetData();
      activate(true);
    }

    function unregisterEvents() {
      Socket.remove('camera:frame');
      Socket.remove('camera:initial');
      Socket.remove('camera:loading');
    }

    function checkMotion() {
      if (data.frame) {
        var last = new Date(data.frame.timestamp)
          , diff = (new Date() - last) / 1000;
        if (Math.ceil(diff) > 3 || isNaN(diff)) {
          data.motion = false;
        } else {
          data.motion = true;
        }
      }
    }
  }
}());
