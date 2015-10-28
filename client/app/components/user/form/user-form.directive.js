(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name components.directive:UserForm
   * @restrict EA
   * @element
   *
   * @description
   *
   */
  angular
    .module('components')
    .directive('userForm', userForm);

  function userForm() {
    var directive = {
      restrict: 'EA',
      scope: {
        user: '=',
        action: '@',
        callback: '='
      },
      templateUrl: 'app/components/user/form/user-form.tpl.html',
      replace: false,
      controller: UserFormCtrl,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  UserFormCtrl.$injector = ['Auth', 'roles', 'toastr'];

  function UserFormCtrl(Auth, roles, toastr) {
    var vm = this
      , currentUserID = Auth.getUser()._id;

    vm.existingUser = vm.action === 'update';
    vm.roles = roles();
    vm.token = Auth.getToken();
    vm.isAdmin = Auth.isAdmin();
    vm.isSelf = currentUserID === vm.user._id;
    vm.showToken = showToken;

    function showToken() {
      toastr.info(vm.token, 'Auth Token', {
        closeButton: true,
        maxOpened: 1,
        tapToDismiss: false,
        timeout: 7000
      });
    }
  }
}());
