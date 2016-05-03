/**
 * @fileoverview splitter panel directive
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

        splitterCtrl.addPanel(scope);
      }
    }
  }
})();
