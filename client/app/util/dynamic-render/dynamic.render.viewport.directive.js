/**
 * @fileoverview dynamic renderer viewport directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('dynamicRenderViewport', dynamicRenderViewport);

  /* @ngInject */
  function dynamicRenderViewport() {
    return {
      restrict: 'A',
      controller: 'DynamicRenderViewportCtrl'
    };
  }
})();
