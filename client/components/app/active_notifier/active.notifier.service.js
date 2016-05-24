/**
 * @fileoverview Active notifier 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('ActiveNotifier', ActiveNotifier);

  /* @ngInject */
  function ActiveNotifier() {

    var _isActive = true;

    this.setStatus = setStatus;
    this.getStatus = getStatus;

    /**
     * 현재 상태를 저장한다.
     * @param {boolean} isActive
     */
    function setStatus(isActive) {
      _isActive = isActive;
    }

    /**
     * 현재 active 상태를 반환한다.
     * @returns {boolean}
     */
    function getStatus() {
      return _isActive;
    }
  }
}());
