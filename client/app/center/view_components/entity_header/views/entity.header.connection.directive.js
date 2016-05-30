/**
 * @fileoverview Connection 오류가 발생했을 때 노출할 Entity header
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('entityHeaderConnection', entityHeaderConnection);

  function entityHeaderConnection(NetInterceptor, jndWebSocket, JndUtil) {
    return {
      restrict: 'EA',
      templateUrl: 'app/center/view_components/entity_header/views/entity.header.connection.html',
      scope: {},
      link: link
    };

    function link(scope, ele, attr)  {
      
      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        _attachScopeEvents();
        _setWarningMsgKey();
      }

      /**
       * scope 이벤트를 binding 한다.
       * @private
       */
      function _attachScopeEvents() {
        scope.$on('NetInterceptor:connect', _setWarningMsgKey);
        scope.$on('NetInterceptor:disconnect', _setWarningMsgKey);
        scope.$on('jndWebSocket:connect', _setWarningMsgKey);
        scope.$on('jndWebSocket:disconnect', _setWarningMsgKey);
      }

      /**
       * 경고 메시지에 대한 L10N 키 값을 설정한다.
       * @private
       */
      function _setWarningMsgKey() {
        var key = '';
        if (!NetInterceptor.isConnected()) {
          key = '@common-connection-retry';
        } else if (!jndWebSocket.isConnected()) {
          key = '@socket-connection-lost';
        }
        JndUtil.safeApply(scope, function() {
          scope.warningMsgKey = key;
        });
      }
    }
  }
})();
