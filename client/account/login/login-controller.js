(function () {
  'use strict';

  /**
   * @ngdoc object
   * @name account.controller:LoginCtrl
   *
   * @description
   *
   */
  angular
    .module('account')
    .controller('LoginCtrl', LoginCtrl);

  function LoginCtrl($location, Auth) {
    var vm = this
      , user = {};

    function tryLogin(form) {
      if (form.$valid) {
        return login(vm.user)
          .then(function (success) {
            if (!success) {
              vm.user = {};
              form.$setPristine();
            }
          });
      }
    }

    function login(userDetails) {
      return Auth.login(userDetails)
        .then(function (token) {
          return token;
        })
        .catch(function () {
          return false;
        });
    }

    vm.user = user;
    vm.tryLogin = tryLogin;
  }
}());
