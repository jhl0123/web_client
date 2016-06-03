/**
 * @fileoverview 센터페널 메세지중 단순 텍스트일때만 관리하는 컨트롤러
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('CenterItemDropdownLayerCtrl', CenterItemDropdownLayerCtrl);

  /* @ngInject */
  function CenterItemDropdownLayerCtrl($scope, memberService, $filter, messageAPIservice, currentSessionHelper, AnalyticsHelper,
                                       MessageSendingCollection, jndPubSub, Dialog) {
    // 현재 로그인되어있는 멤버(나)의 아이디
    var _myId;
    // 현재 토픽의 타입
    var _entityType;
    // 현재 토픽의 아이디
    var _entityId;

    $scope.msg = {
      message: {
        id: 0,
        isStarred: false
      }
    };
    $scope.msg = {};
    $scope.isShown = false;
    $scope.isMyMessage = false;
    $scope.showAnnouncement = false;
    $scope.deleteMessage = deleteMessage;
    $scope.createAnnouncement = createAnnouncement;

    _init();

    /**
     * 초기화 함수
     * @private
     */
    function _init() {
    }

    /**
     * local variable들을 새로 세팅한다.
     * @private
     */
    function _resetLocalVariables() {
      _myId = memberService.getMemberId();
      _entityType = currentSessionHelper.getCurrentEntityType();
      _entityId = currentSessionHelper.getCurrentEntityId();
    }

    /**
     * 메시지를 삭제한다.
     */
    function deleteMessage() {
      _resetLocalVariables();

      Dialog.confirm({
        body: $filter('translate')('@web-notification-body-messages-confirm-delete'),
        onClose: function(result) {
          if (result === 'okay') {
            if ($scope.msg.status === 'sending' || $scope.msg.status === 'failed') {
              //MessageCollection.
              MessageSendingCollection.remove($scope.msg);
            } else {
              if ($scope.msg.message.contentType === 'sticker') {
                messageAPIservice.deleteSticker($scope.msg.messageId)
                  .success(function() {
                    Dialog.success({
                      title: $filter('translate')('@message-deleted')
                    });
                  });
              } else {
                messageAPIservice.deleteMessage(_entityType, _entityId, $scope.msg.messageId)
                  .success(function () {
                    Dialog.success({
                      title: $filter('translate')('@message-deleted')
                    });

                    try {
                      AnalyticsHelper.track(AnalyticsHelper.EVENT.MESSAGE_DELETE, {
                        'MESSAGE_ID': $scope.msg.messageId,
                        'RESPONSE_SUCCESS': true
                      });
                    } catch (e) {
                    }
                  })
                  .error(function (response) {
                    try {
                      AnalyticsHelper.track(AnalyticsHelper.EVENT.MESSAGE_DELETE, {
                        'RESPONSE_SUCCESS': false,
                        'ERROR_CODE': response.code
                      });
                    } catch (e) {
                    }
                  });
              }
            }
          }
        }
      });
    }

    /**
     * 현재 메세지를 사용하여 announcement 을 만드는 펑션을 호출하라고 broadcast 한다.
     */
    function createAnnouncement() {
      _resetLocalVariables();
      var param = {
        'entityId': _entityId,
        'messageId': $scope.msg.messageId
      };

      jndPubSub.pub('createAnnouncement', param);
    }
  }
})();
