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
      , info = {}
      , streaming
      , loading
      , activeTimer
      , active
      , frame = {};

    service = {
      activate   : activate,
      play       : play,
      stop       : stop,
      reset      : reset,

      // Variables
      isStreaming: streaming,
      info       : info,
      loading    : loading,
      active     : active,
      frame      : frame
    };

    return service;

    /**
     * Public Methods
     */

    function activate(autostart) {
      return getInfo()
        .then(function () {
          if (info.ready) {
            if (!info.isStreaming && autostart) {
              Socket.emit('camera:start');
              streaming = true;
            }
            registerEvents();
            activeTimer = $interval(checkActive, 3000);
          } else {
            // display error or do nothing
            logger.log(TAG, 'TODO implment camera feed not available');
          }
        });
    }

    function play() {
      if (streaming) {
        logger.log(TAG, 'Pausing the camera feed');
        unregisterEvents();
        streaming = false;
      } else {
        logger.log(TAG, 'Resuming the camera feed');
        registerEvents();
        streaming = false;
      }
    }

    function stop() {
      Socket.emit('camera:stop');
      streaming = false;
      if (angular.isDefined(activeTimer)) {
        logger.log(TAG, 'Stopping motion active checker');
        $interval.cancel(activeTimer);
        activeTimer = undefined;
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
      Socket.emit('camera:info', null, function (data) {
        logger.log(TAG, 'Recieved camera information from the server');
        info = data;
        q.resolve();
      });
      return q.promise;
    }

    function registerEvents() {
      Socket.on('camera:loading', function () {
        logger.log(TAG, 'Camera feed is loading');
        loading = true;
      });
      Socket.on('camera:initial', function () {
        logger.log(TAG, 'Recieved initial frame');
        loading = true;
      });
      Socket.on('camera:frame', function (data) {
        frame.timestamp = Date.now();
        frame.prev = frame.src;
        frame.src = 'data:image/jpeg;base64, ' + data;
      });
    }

    function unregisterEvents() {
      Socket.remove('camera:frame');
      Socket.remove('camera:initial');
      Socket.remove('camera:loading');
    }

    function checkActive() {
      var last = new Date(frame.timestamp)
        , diff = (new Date() - last) / 1000;
      if (Math.ceil(diff) > 3) {
        active = false;
      } else {
        active = false;
      }
    }
  }
}());
