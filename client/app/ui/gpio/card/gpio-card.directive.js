(function () {
  'use strict';

  /* @ngdoc directive
   * @name ui.gpio.directive:gpioCard
   * @restrict EA
   * @element
   * <div gpio-card></div>
   * <gpio-card></gpio-card>
   * @description
   * Card containing the gpio interactions
   *
   */
  angular
    .module('ui.gpio')
    .directive('gpioCard', gpioCardConfig);

  /** @ngInject */
  function gpioCardConfig(pinData) {
    var directive = {
      scope: {},
      templateUrl: 'app/ui/gpio/card/gpio-card.tpl.html',
      restrict: 'EA',
      replace: false,
      controller: CtrlFunct,
      controllerAs: 'vm',
      bindToController: true,
      link: LinkFunct
    };

    return directive;

    /** @ngInject */
    function CtrlFunct(logger) {
      var vm = this;
      vm.toggle = toggle;

      activate();

      function activate() {
        pinData.activate().then(function (data) {
          vm.gpios = data;
          logger.log('GPIO', 'Card activated');
        });
      }

      function toggle(pinPair) {
        pinData.toggle(pinPair).then(function () {
          // Toggle was successful
        });
      }
    }

    function LinkFunct(scope) {
      scope.$on('$destroy', function () {
        pinData.deactivate();
      });
    }
  }
}());
