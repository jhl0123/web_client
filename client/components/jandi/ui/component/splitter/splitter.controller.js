/**
 * @fileoverview splitter controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('SplitterCtrl', SplitterCtrl);

  /* @ngInject */
  function SplitterCtrl($scope) {
    var _that = this;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope.panels = [];
      _that.addPanel = addPanel;
    }

    /**
     * split 될 panel의 scope를 추가함
     * @param {object} scope
     */
    function addPanel(scope) {
      $scope.panels.push(scope);
    }
  }
})();
