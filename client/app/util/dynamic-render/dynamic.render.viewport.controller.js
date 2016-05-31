/**
 * @fileoverview dynamic renderer viewport controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('DynamicRenderViewportCtrl', DynamicRenderViewportCtrl);

  /* @ngInject */
  function DynamicRenderViewportCtrl($element) {
    var _that = this;

    var _regxNumber = /^[\d]+/;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      _that.maxHeight = +(_regxNumber.exec($element.css('maxHeight')));
    }
  }
})();
