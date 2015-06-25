/**
 * @fileoverview 센터페널 메세지중 단순 텍스트일때만 관리하는 컨트롤러
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TextMessageCtrl', TextMessageCtrl);

  /* @ngInject */
  function TextMessageCtrl($scope, memberService, $filter, messageAPIservice, currentSessionHelper, jndPubSub) {
    // 현재 로그인되어있는 멤버(나)의 아이디
    var myId = memberService.getMemberId();
    // 현재 디렉티브가 가지고 있는 메시지 객체
    var message = $scope.msg;
    var messageId = message.messageId;
    // 현재 토픽의 타입
    var _entityType = currentSessionHelper.getCurrentEntityType();
    // 현재 토픽의 아이디
    var _entityId = currentSessionHelper.getCurrentEntityId();

    // 현재 메시지가 나의 메시지인지 알려주는 flag
    $scope.isMyMessage = myId === message.fromEntity;

    $scope.deleteMessage = deleteMessage;
    $scope.createAnnouncement = createAnnouncement;

    /**
     * 메시지를 삭제한다.
     */
    function deleteMessage() {
      if (confirm($filter('translate')('@web-notification-body-messages-confirm-delete'))) {
        if (message.message.contentType === 'sticker') {
          messageAPIservice.deleteSticker(messageId);
        } else {
          messageAPIservice.deleteMessage(_entityType, _entityId, messageId);
        }
      }
    }

    /**
     * 현재 메세지를 사용하여 announcement 을 만드는 펑션을 호출하라고 broadcast 한다.
     */
    function createAnnouncement() {
      var param = {
        'entityId': _entityId,
        'messageId': messageId
      };

      jndPubSub.pub('createAnnouncement', param);
    }
  }
})();
