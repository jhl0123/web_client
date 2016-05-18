/**
 * @fileoverview splitter에 구성되는 panel directive
 */
(function() {
  'use strict';
  
  angular
    .module('jandi.ui.splitter')
    .directive('splitterPanel', splitterPanel);
  
  function splitterPanel() {
    return {
      restrict: 'A',
      require: '^splitter',
      scope: true,
      link: link
    };
    
    function link(scope, el, attrs, splitterCtrl) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.jqPanel = el;
        scope.minSize = +(attrs.minSize || 0);
        scope.maxSize = +(attrs.maxSize || Infinity);
        scope.size = +attrs.size;

        splitterCtrl.addPanel(scope);
      }
    }
  }
})();
