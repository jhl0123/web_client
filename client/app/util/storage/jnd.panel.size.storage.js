/**
 * @fileoverview local storage에 Panel Size를 관리하는 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndPanelSizeStorage', JndPanelSizeStorage);

  /* @ngInject */
  function JndPanelSizeStorage(JndLocalStorage) {
    var _that = this;

    var DEFAULT_LEFT_PANEL_WIDTH = 240 ;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      _.extend(JndPanelSizeStorage.prototype, JndLocalStorage);

      _that.getLeftPanelWidth = getLeftPanelWidth;
      _that.setLeftPanelWidth = setLeftPanelWidth;

      _that.setMiddleKey('panel.size');
    }

    /**
     * get left panel size
     * @returns {number}
     */
    function getLeftPanelWidth() {
      return +_that.get('left', 'width') || DEFAULT_LEFT_PANEL_WIDTH;
    }

    /**
     * set left panel size
     * @param {number} panelSize
     */
    function setLeftPanelWidth(panelSize) {
      _that.set('left', 'width', panelSize);
    }
  }
})();
