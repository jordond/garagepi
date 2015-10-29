(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name components.directive:userFormButtons
   * @restrict EA
   * @element
   *
   * @description
   *
   */
  angular
    .module('components')
    .directive('userFormButtons', userFormButtons);

  function userFormButtons() {
    var directive = {
      restrict: 'EA',
      scope: {
        user: '=',
        form: '=',
        action: '@',
        callback: '='
      },
      templateUrl: 'app/components/user/form/user-form-buttons.tpl.html',
      replace: false,
      controller: UserFormButtonsCtrl,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  /** @ngInject */
  function UserFormButtonsCtrl($log, UserData) {
    var vm = this;

    vm.submit = submit;

    function submit(action) {
      if (action === 'create') {
        create(vm.user);
      } else if (action === 'update') {
        update(vm.user);
      } else if (action === 'change') {
        changePassword(vm.user);
      } else {
        $log.warn('[userFormButtons] Invalid action supplied: ' + action);
      }
    }

    function create(user) {
      UserData.create(user)
        .then(callSuccess)
        .catch(callFailed);
    }

    function update(user) {
      UserData.update(user)
        .then(callSuccess)
        .catch(callFailed);
    }

    function changePassword(user) {
      UserData.changePassword(user.id, user.old, user.new)
        .then(callSuccess)
        .catch(callFailed);
    }

    function callSuccess(response) {
      vm.form.$setPristine();
      vm.callback(true, response);
    }

    function callFailed(response) {
      if (angular.isArray(response)) {
        response.forEach(function (field) {
          if (vm.form.hasOwnProperty(field)) {
            vm.form[field].$invalid = true;
          }
        });
      }

      vm.form.$invalid = true;
      vm.callback(false, response);
    }
  }
}());
