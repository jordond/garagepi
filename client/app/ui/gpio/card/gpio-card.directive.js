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
  function gpioCardConfig() {
    var directive = {
      scope: {},
      templateUrl: 'app/ui/gpio/card/gpio-card.tpl.html',
      restrict: 'EA',
      replace: false,
      controller: CtrlFunct,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function CtrlFunct(pinData) {
      var vm = this;
      vm.name = 'gpioCard';
      pinData.activate().then(function (data) {
        vm.gpios = data;
      });
    }
  }
}());
