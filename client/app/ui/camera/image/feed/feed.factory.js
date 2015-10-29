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
      , registered
      , disconnected
      , reconnectTimeout
      , motionTimer;

    data = {
      started: false,
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
      info   : getInfo,
      data   : data
    };

    return service;

    /**
     * Public Methods
     */

    function init(autostart) {
      Socket.onRefresh('connect', onConnect);
      Socket.onRefresh('disconnect', onDisconnect);
      return activate(autostart);
    }

    function toggle() {
      if (!data.started) {
        start(resume = true);
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

    function stop() {
      resume = false;
      stopFeed();
    }

    function destroy() {
      Socket.remove('disconnect', onDisconnect);
      stopFeed();
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
            data.loading = true;
          } else if (info.error) {
            logger.log(TAG, 'Camera feed not available Error: ' + info.error.message);
            data.error.hasError = true;
            data.error.message = info.error.message;
            return $q.reject();
          }
          return $q.resolve();
        })
        .catch(function (err) {
          logger.log(TAG, 'Activate failed: ' + err);
          return $q.reject(err);
        });
    }

    function start(shouldStart) {
      if (resume || shouldStart) {
        if (!disconnected) {
          registerEvents();
        }
        Socket.emit('camera:start');
        motionTimer = $interval(checkMotion, 3000);
        resume = true;
        data.streaming = true;
        data.started = true;
        data.error = {};
      }
    }

    function stopFeed() {
      if (data.started) {
        if (!disconnected) {
          unregisterEvents();
          Socket.emit('camera:stop');
        }
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
      data.streaming = false;
      data.loading = false;
      data.motion = false;
      data.frame = {};
      data.error.hasError = false;
    }

    function onConnect(event, isRefresh) {
      if ((!reconnectTimeout && disconnected) || isRefresh) {
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

    function onError(err) {
      stopFeed();
      data.error = err.error;
      data.info = err.config;
    }

    function onDisconnect(event, isRefresh) {
      disconnected = true;
      stopFeed();
      if (isRefresh) {
        registered = false;
        data.loading = true;
      } else {
        resetData();
        data.error = {
          hasError: true,
          message: 'Connection to server has been lost'
        };
      }
      if (reconnectTimeout) {
        reconnectTimeout.cancel();
        reconnectTimeout = null;
      }
    }

    function getInfo() {
      var q = $q.defer();
      if (data.info) {
        return $q.when(data.info);
      }
      Socket.emit('camera:info', null, function (info) {
        logger.log(TAG, 'Recieved camera information from the server');
        q.resolve(info);
      });
      return q.promise;
    }

    function registerEvents() {
      if (registered) { return; }
      logger.log(TAG, 'Registering camera events');
      Socket.on('camera:error', onError);
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
        data.loading = false;
        data.motion = true;
        data.frame = {
          timestamp: Date.now(),
          src: 'data:image/jpeg;base64,' + frame,
          prev: prev
        };
      });
      registered = true;
    }

    function unregisterEvents() {
      if (!disconnected) {
        Socket.remove('camera:loading');
        Socket.remove('camera:initial');
        Socket.remove('camera:frame');
        registered = false;
      }
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
