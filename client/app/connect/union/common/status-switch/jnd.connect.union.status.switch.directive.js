/**
 * @fileoverview switch button directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectStatusSwitch', jndConnectStatusSwitch);

  /* @ngInject */
  function jndConnectStatusSwitch(Dialog, JndConnectUnionApi, JndUtil) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        connectId: '=',
        unionName: '=',
        active: '=',
        isNonApiCall: '=?',
        onConfirmCallback: '&?',
        onSuccessCallback: '&?',
        onErrorCallback: '&?'
      },
      templateUrl : 'app/connect/union/common/status-switch/jnd.connect.union.status.switch.html',
      link: link
    };

    function link(scope) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.onToggle = onToggle;
      }

      /**
       * on toggle 이벤트 핸들러
       */
      function onToggle($event) {
        if (scope.isNonApiCall) {
          scope.active = !scope.active;
        } else {
          // toggle 시 api를 호출해야하는 상황
          // connection 된 후 해당 정보를 update하는 경우
          if (scope.active) {
            Dialog.confirm({
              body: '@이 연동을 중지하시겠습니까?',
              confirmButtonText: '@중지하기',
              stopPropagation: true,
              onClose: function(result) {
                if (result === 'okay') {
                  scope.active = false;
                  _confirmCallback(false);
                  _requestConnectStatus();
                }
              }
            });
          } else {
            scope.active = true;
            _confirmCallback(true);
            _requestConnectStatus();
          }
        }
      }

      /**
       * confirm callback
       * @param {boolean} value
       * @private
       */
      function _confirmCallback(value) {
        scope.onConfirmCallback({
          $value: value
        });
      }

      /**
       * request set connect status
       * @private
       */
      function _requestConnectStatus() {
        // status api call
        JndConnectUnionApi.setStatus(scope.unionName, scope.connectId, scope.active)
          .success(_onSuccessSetStatus)
          .error(_onErrorSetStatus);
      }

      /**
       * request success 콜백
       * @private
       */
      function _onSuccessSetStatus() {
        scope.onSuccessCallback();
      }

      /**
       * request error 콜백
       * @param {object} response
       * @private
       */
      function _onErrorSetStatus(response) {
        JndUtil.alertUnknownError(response);
        scope.onErrorCallback({
          $value: response
        });
      }
    }
  }
})();
