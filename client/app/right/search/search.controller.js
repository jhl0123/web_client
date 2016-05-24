/**
 * @fileoverview right panel 상단에 위치한 search input box의 controller 이다.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightSearchCtrl', RightSearchCtrl);

  /* @ngInject */
  function RightSearchCtrl($scope) {
    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope.isConnected = true;

      _attachScopeEvents();
    }

    /**
     * attach scope events
     * @private
     */
    function _attachScopeEvents() {
      $scope.$on('NetInterceptor:connect', _onConnected);
      $scope.$on('NetInterceptor:disconnect', _onDisconnected);
    }

    /**
     * socket connection handler
     * @private
     */
    function _onConnected() {
      $scope.isConnected = true;
    }

    /**
     * socket disconnection handler
     * @private
     */
    function _onDisconnected() {
      $scope.isConnected = false;
    }
  }
})();
