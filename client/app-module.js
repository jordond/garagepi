(function () {
  'use strict';

  /* @ngdoc object
   * @name app
   * @description
   *
   */
  angular
    .module('app', [
      'ui.router',
      'ngCookies',
      'ngResource',
      'ngMessages',
      'ngSanitize',
      'ngAnimate',
      'mgcrea.ngStrap',
      'angularMoment',
      'toastr',
      'jutaz.ngSweetAlertAsPromised',
      'components',
      'app.dashboard',
      'app.account',
      'app.system',
      'app.ui'
    ]);

  angular
    .module('app')
    .config(config)
    .run(run);

  function config($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  }

  function run($rootScope, $state, roles, Auth, AuthEvent, Socket, Token, logger) {
    if (Token.has()) {
      Auth.getSelf()
        .then(function () {
          AuthEvent.authenticated(true);
        });
    }

    $rootScope.$on('$stateChangeStart', function (event, next) {
      var userRole
        , requiredRole;

      if (next.role !== 'guest') {
        Auth.getUserAsync().then(function (user) {
          if (Auth.isLoggedIn()) {
            userRole = roles().indexOf(user.role);
            requiredRole = roles().indexOf(next.role);
            if (userRole < requiredRole) {
              event.preventDefault();
              $state.go('dashboard');
              logger.warning('You\'re not allowed to access that page', '', 'Forbidden');
            }
          } else {
            event.preventDefault();
            $state.go('login');
          }
        });
      } else if (next.name === 'login' && Auth.isLoggedIn()) {
        event.preventDefault();
      }
    });

    AuthEvent.onAuth(function () {
      var user = Auth.getUser();
      Socket.emit('info', user.username + ' has connected.');
      AuthEvent.onRevoke(user._id, Auth.logout);
    });
  }
}());
