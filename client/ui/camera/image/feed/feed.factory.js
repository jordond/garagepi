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
    .module('ui.camera.image')
    .factory('Feed', FeedConfig);

  /** @ngInject */
  function FeedConfig($q, $interval, $timeout, Socket, logger) {
    var TAG = 'Feed'
      , service
      , data
      , resume
      , disconnected
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
      init   : init,
      toggle : toggle,
      stop   : stop,
      destroy: destroy,
      data   : data
    };

    return service;

    /**
     * Public Methods
     */

    function init(start) {
      Socket.onRefresh('connect', onConnect);
      Socket.on('disconnect', onDisconnect); // todo on refresh as well?
      return activate(start);
    }

    function toggle() {
      if (!data.started) {
        start();
      } else if (data.streaming) {
        logger.log(TAG, 'Pausing the camera feed');
        data.streaming = false;
        resume = false;
      } else {
        logger.log(TAG, 'Resuming the camera feed');
        data.streaming = true;
        resume = true;
      }
    }

    function destroy() {
      Socket.remove('disconnect', onDisconnect);
      stop();
      resetData();
      if (reconnectTimeout) {
        reconnectTimeout.cancel();
      }
    }

    /**
     * Private functions
     */

    function activate(autostart) {
      return getInfo()
        .then(function (info) {
          data.info = info;
          if (info.ready) {
            start(autostart);
          } else {
            logger.log(TAG, 'Camera feed not available Error: ' + info.error);
            data.error.hasError = true;
            data.error.message = info.error;
          }
        })
        .catch(function (err) {
          logger.log(TAG, 'Activate failed: ' + err);
          return $q.reject(err);
        });
    }

    function start(start) {
      if (resume || start) {
        registerEvents();
        Socket.emit('camera:start');
        motionTimer = $interval(checkMotion, 3000);
        data.streaming = true;
        data.started = true;
        data.error.hasError = false;
      }
    }

    function stop() {
      if (data.started) {
        resume = false;
        unregisterEvents();
        Socket.emit('camera:stop');
        resetData();
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

    function onDisconnect() {
      disconnected = true;
      stop();
      resetData();
      data.error = {
        hasError: true,
        message: 'Connection to server has been lost'
      };
      if (reconnectTimeout) {
        reconnectTimeout.cancel();
      }
    }

    function onConnect() {
      if (!reconnectTimeout && disconnected) {
        reconnectTimeout = $timeout(run, 2000);
        disconnected = false;
      }

      function run() {
        logger.log(TAG, 'Attempting to reactivate camera feed');
        reconnectTimeout = null;
        resetData();
        start();
      }
    }

    function getInfo() {
      var q = $q.defer();
      Socket.emit('camera:info', null, function (info) {
        logger.log(TAG, 'Recieved camera information from the server');
        q.resolve(info);
      });
      return q.promise;
    }

    function registerEvents() {
      logger.log(TAG, 'Registering camera events');
      Socket.on('camera:loading', function () {
        if (!data.streaming) { return; }
        logger.log(TAG, 'Camera feed is loading');
        data.loading = true;
      });
      Socket.on('camera:initial', function (frame) {
        if (!data.streaming) { return; }
        logger.log(TAG, 'Recieved initial frame');
        data.frame = {
          timestamp: Date.now(),
          src: 'data:image/jpeg;base64,' + frame,
          prev: 'data:image/jpeg;base64,' + frame
        };
        $timeout(function () {
          data.loading = false;
        }, 30 * 1000);
      });
      Socket.on('camera:frame', function (frame) {
        if (!data.streaming) { return; }
        var prev = data.frame.src;
        //data.loading = false; // todo remove after testing
        data.motion = true;
        data.frame = {
          timestamp: Date.now(),
          src: 'data:image/jpeg;base64,' + frame,
          prev: prev
        };
      });
    }

    function unregisterEvents() {
      Socket.remove('camera:loading');
      Socket.remove('camera:initial');
      Socket.remove('camera:frame');
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
