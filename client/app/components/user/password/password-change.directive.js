(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name components.directive:passwordChange
   * @restrict EA
   * @element
   *
   * @description
   *
   *
   */
  angular
    .module('components')
    .directive('passwordChange', passwordChange);

  function passwordChange() {
    var directive = {
      restrict: 'EA',
      scope: {
        id: '@'
      },
      template: [
        '<div class="btn btn-info" ng-click="vm.init()">',
        'Change Password',
        '</div>'
      ].join(''),
      replace: false,
      controllerAs: 'vm',
      controller: CtrlFunct
    };

    return directive;


    /** @ngInject */
    function CtrlFunct($scope, $modal, Auth) {
      var vm = this
        , copy
        , modal;

      copy = {
        id: $scope.id
      };

      /**
        * Initialize the modal, and asign scope values
        */
      function init() {
        vm.password = angular.copy(copy);
        vm.isAdmin = Auth.isAdmin();

        modal = $modal({
          title: 'Change Password',
          template: 'app/components/user/password/password-change-modal.tpl.html',
          show: false,
          animation: 'am-fade-and-slide-top'
        });

        modal.$scope.callback = callback;
        modal.$scope.password = vm.password;
        modal.$scope.isAdmin = vm.isAdmin;

        show();
      }

      function callback(success, response) {
        if (!success && angular.isDefined(response)) {
          modal.$scope.password = angular.copy(copy);
        } else {
          destroy();
        }
      }

      /**
        * When the modal is loaded, display it.
        */
      function show() {
        modal.$promise
          .then(modal.show);
      }

      /**
        * Hide and destroy the modal
        */
      function destroy() {
        modal.$promise
          .then(function () {
            modal.hide();
            modal.destroy();
          });
      }

      $scope.$on('destroy', function () {
        if (modal) {
          modal.destroy();
          modal = undefined;
        }
      });

      vm.init = init;
    }
  }
}());
