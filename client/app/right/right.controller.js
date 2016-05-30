/**
 * @fileoverview right panel 전체를 감싸고 있는 controller 이다.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelCtrl', rPanelCtrl);

  /* ngInject */
  function rPanelCtrl($scope, $filter, $timeout, jndPubSub, RightPanel) {
    _init();

    /**
     * Default set-up.
     * @private
     */
    function _init() {
      $scope.closeRightPanel = closeRightPanel;
      _initTab();

      _attachScopeEvents();
    }

    /**
     * attach scope events
     * @private
     */
    function _attachScopeEvents() {
      $scope.$on('NetInterceptor:connect', _onConnected);
    }

    /**
     * 네트워크 활성 이벤트 핸들러
     * @private
     */
    function _onConnected() {
      _initTab();
    }

    /**
     * init tab
     * @private
     */
    function _initTab() {
      $scope.tabs = RightPanel.getTabStatus();
      $scope.activeTabName = _getActiveTabName();
    }

    /**
     * right panel이 on 되었다는 event handling
     */
    $scope.$on('rightPanelStatusChange', function($event, data) {
      var tab;

      if (tab = $scope.tabs[data.type]) {
        if (data.toUrl !== data.fromUrl) {
          tab.isActive = true;
          $scope.activeTabName = _getActiveTabName();

          if (data.fromTitle !== 'FILE DETAIL') {
            $timeout(function() {
              jndPubSub.pub('rPanelSearchFocus');
            }, 100);
          }
        }
      }
    });

    /**
     * close right panel publish
     */
    function closeRightPanel() {
      jndPubSub.pub('closeRightPanel');
    }

    /**
     * l10n 반영된 tab명을 전달함.
     * @returns {*}
     * @private
     */
    function _getActiveTabName() {
      var activeTab  = RightPanel.getActiveTab();
      var name;

      if (activeTab) {
        name = $filter('translate')(activeTab.l10n);
      }

      return name;
    }
  }
})();
