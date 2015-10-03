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
  function FeedConfig($q, $interval, Socket, logger) {
    var TAG = 'Feed'
      , service
      , data
      , motionTimer;

    data = {
      started: false,
      info: {},
      streaming: false,
      loading: false,
      motion: false,
      frame: {}
    };

    service = {
      activate: activate,
      toggle  : toggle,
      stop    : stop,
      reset   : reset,
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
            if (!info.isCapturing && !autostart) {
              start();
            }
            registerEvents();
          } else {
            // display error or do nothing
            logger.log(TAG, 'TODO implment camera feed not available');
          }
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
      Socket.emit('camera:stop');
      data.streaming = false;
      if (angular.isDefined(motionTimer)) {
        logger.log(TAG, 'Stopping motion active checker');
        $interval.cancel(motionTimer);
        motionTimer = undefined;
      }
    }

    function reset() {
      // to do implement on the sever
      Socket.emit('camera:reset');
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
      Socket.emit('camera:start');
      motionTimer = $interval(checkMotion, 3000);
      data.streaming = true;
      data.started = true;
    }

    function registerEvents() {
      logger.log(TAG, 'Registering camera events');
      Socket.on('camera:loading', function () {
        logger.log(TAG, 'Camera feed is loading');
        data.loading = true;
      });
      Socket.on('camera:initial', function () {
        logger.log(TAG, 'Recieved initial frame');
        data.loading = true;
      });
      Socket.on('camera:frame', function (frame) {
        data.loading = false;
        data.frame.timestamp = Date.now();
        data.frame.prev = data.frame.src;
        data.frame.src = 'data:image/jpeg;base64, ' + frame;
      });
    }

    function unregisterEvents() {
      Socket.remove('camera:frame');
      Socket.remove('camera:initial');
      Socket.remove('camera:loading');
    }

    function checkMotion() {
      var last = new Date(data.frame.timestamp)
        , diff = (new Date() - last) / 1000;
      if (Math.ceil(diff) > 3 || isNaN(diff)) {
        data.motion = false;
      } else {
        data.motion = true;
      }
    }
  }
}());
