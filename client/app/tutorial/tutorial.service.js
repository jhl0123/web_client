/**
 * @fileoverview 튜토리얼 툴팁 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Tutorial', Tutorial);

  function Tutorial(jndPubSub) {
    this.hideTooltip = hideTooltip;
    this.showTooltip = showTooltip;

    this.showPopover = showPopover;
    this.hidePopover = hidePopover;

    this.complete = complete;

    _init();

    /**
     * 초기화 메서드
     * @private
     */
    function _init() {
    }

    /**
     * 모든 툴팁을 노출한다.
     */
    function showTooltip() {
      jndPubSub.pub('Tutorial:showTooltip');
    }

    /**
     * tooltipName 에 해당하는 tooltip 을 감춘다.
     * @param {string} tooltipName
     */
    function hideTooltip(tooltipName) {
      jndPubSub.pub('Tutorial:hideTooltip', tooltipName);
    }

    /**
     * popover 를 노출한다.
     */
    function showPopover() {
      jndPubSub.pub('Tutorial:showPopover');
    }

    /**
     * popover 를 감춘다.
     */
    function hidePopover() {
      jndPubSub.pub('Tutorial:hidePopover');
    }

    /**
     * 튜토리얼이 완료되었다.
     */
    function complete() {
      jndPubSub.pub('Tutorial:complete');
    }
  }
})();
