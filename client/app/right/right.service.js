/**
 * @fileoverview right panel service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('RightPanel', RightPanel);

  /* @ngInject */
  function RightPanel($state, jndPubSub) {
    var _that = this;
    var _tabs = {
      files: {
        l10n: '@common-file',
        isActive: false
      },
      messages: {
        l10n: '@common-message',
        isActive: false
      },
      stars: {
        l10n: '@common-star',
        isActive: false
      },
      mentions: {
        l10n: '@common-mention',
        isActive: false
      }
    };

    var _tail;

    _that.initTabs = initTabs;

    _that.isOpen = isOpen;
    _that.isOpenFileDetail = isOpenFileDetail;

    _that.closeTabs = closeTabs;

    _that.getTabStatus = getTabStatus;
    _that.getActiveTab = getActiveTab;
    _that.getStateName = getStateName;

    _that.getTail = getTail;
    _that.setTail = setTail;

    _that.pubRendered = pubRendered;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
    }

    /**
     * init tab status
     * @private
     */
    function initTabs() {
      var currentRightPanel = getStateName($state.current);

      if (currentRightPanel) {
        // active된 right panel에 따라 header icon 활성화 여부를 설정한다.
        _tabs[currentRightPanel].isActive = true;
      }
    }

    /**
     * right panel open 여부
     * @returns {*|boolean}
     */
    function isOpen() {
      return $state.includes('**.files.**') ||
        $state.includes('messages.detail.messages') ||
        $state.includes('**.stars.**') ||
        $state.includes('**.mentions.**');
    }

    /**
     * file detail open 여부
     * @returns {*|boolean}
     */
    function isOpenFileDetail() {
      return $state.includes('**.files.item') ||
        $state.includes('**.stars.item') ||
        $state.includes('**.mentions.item');
    }

    /**
     * close tabs
     */
    function closeTabs() {
      _.each(_tabs, function(tab) {
        tab.isActive = false;
      });
    }

    /**
     * 텝의 상태를 전달함.
     * @returns *
     */
    function getTabStatus() {
      return _tabs;
    }

    /**
     * 활성화된 템을 전달함.
     * @returns {Object|*}
     */
    function getActiveTab() {
      return _.find(_tabs, function(tab) {
        return tab.isActive === true;
      });
    }

    /**
     * state에 대한 right panel의 템 명을 전달함.
     * @param {object} currentState
     * @returns {Array|{index: number, input: string}|*}
     */
    function getStateName(currentState) {
      var match = /messages.detail.([a-z]+)/i.exec(currentState.name);
      return match && match[1];
    }

    /**
     * 오른쪽 패널에서 뒤로가기 기능 사용하여 직전 state를 전달함.
     * @returns {*}
     */
    function getTail() {
      return _tail;
    }

    /**
     * 오른쪽 패널에서 뒤로가기 기능 사용시 전달할 직전 state를 저장함.
     * @param value
     */
    function setTail(value) {
      _tail = value;
    }

    /**
     * pub rendered
     */
    function pubRendered() {
      jndPubSub.pub('RightPanel:rendered');
    }
  }
})();
