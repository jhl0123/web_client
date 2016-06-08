/**
 * @fileoverview topic connector directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('connectPlug', connectPlug);

  /* @ngInject */
  function connectPlug(memberService) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        data: '=jndDataModel',
        isAdmin: '=',
        isOwner: '=',
        onSettingCallback: '&onSetting',
        onDeleteCallback: '&onDelete'
      },
      templateUrl : 'app/center/view_components/entity_header/room-connector/connect-plug/connect.plug.html',
      link: link
    };

    function link(scope) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.data.isActive = scope.data.status === 'enabled';

        scope.isConnector = _isConnector();
        scope.isAllowUpdate = scope.isConnector || scope.isAdmin || scope.isOwner;

        scope.onSettingClick = onSettingClick;
        scope.onDeleteClick = onDeleteClick;

        _attachEvents();
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        scope.$watch('data.status', _onStatusChange);
        scope.$watch('isAdmin', _onIsAdminChange);
        scope.$watch('isOwner', _onIsOwnerChange);
      }

      /**
       * 커넥트 상태 변경 이벤트 핸들러
       * @param {string} value
       * @private
       */
      function _onStatusChange(value) {
        scope.data.isActive = value === 'enabled';
      }

      /**
       * 관리자 여부 변경 이벤트 핸들러
       * @param {boolean} value
       * @private
       */
      function _onIsAdminChange(value) {
        scope.isAllowUpdate = scope.isConnector || value || scope.isOwner;
      }

      /**
       * 토픽 생성자 여부 변경 이벤트 핸들러
       * @param {boolean} value
       * @private
       */
      function _onIsOwnerChange(value) {
        scope.isAllowUpdate = scope.isConnector || scope.isAdmin || value;
      }

      /**
       * setting handler
       * @param event
       */
      function onSettingClick(event) {
        event.stopPropagation();

        scope.onSettingCallback({
          $connectId: scope.data.connectId,
          $unionName: scope.data.unionName
        });
      }

      /**
       * delete handler
       * @param {object} event
       */
      function onDeleteClick(value) {
        if (value) {
          scope.onDeleteCallback({
            $connectId: scope.data.connectId,
            $value: value
          });
        }
      }

      /**
       * connect를 생성한 connector 여부
       * @private
       */
      function _isConnector() {
        return memberService.getMemberId() === scope.data.memberId;
      }
    }
  }
})();
