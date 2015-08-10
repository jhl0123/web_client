/**
 * @fileoverview message controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('MessageCtrl', MessageCtrl);

  /* @ngInject */
  function MessageCtrl($scope, $state, $filter, EntityMapManager, MessageQuery, jndPubSub, MessageData,
                       currentSessionHelper, entityAPIservice, memberService, messageAPIservice) {
    _init();

    // First function to be called.
    function _init() {
      // message controller�� ���޵Ǵ� data�� message search, star, mention���� ���� �ٸ��Ƿ� message data��
      // message controller���� ��밡���� data format���� convert��
      var message = $scope.message = MessageData.convert($scope.messageType, $scope.messageData);

      $scope.writer = EntityMapManager.get('total', message.writerId);

      $scope.writerName = $scope.writer.name;
      $scope.profileImage = $filter('getSmallThumbnail')($scope.writer);
      $scope.createDate = $filter('getyyyyMMddformat')(message.createdAt);
      $scope.startPoint = _getMessageStartPoint(message);
      $scope.content = _getContent(message);

      $scope.hasStar = message.hasStar || false;
      $scope.isStarred = message.isStarred || false;

      $scope.onMessageCardClick = onMessageCardClick;
    }

    /**
     * message content ����
     * @param {object} message
     * @returns {*}
     * @private
     */
    function _getContent(message) {
      var content = message.contentBody;

      if (message.mentions && message.mentions.length > 0) {
        // mentions�� �����Ѵٸ� mentions parse�Ͽ� content ����
        content = $filter('mention')(content, message.mentions, false);
      }

      return content;
    }

    /**
     *
     * @param message
     * @returns {*}
     * @private
     */
    function _getMessageStartPoint(message) {
      var startPoint;

      if (message.contentType === 'text') {
        // type�� text��� topic ������ ������
        startPoint =  message.roomName || 'unknown topic';
      } else {
        // type�� text�� �ƴ϶�� file ������ ������
        startPoint = message.feedbackTitle;
      }

      return startPoint;
    }

    /**
     * message card click �̺�Ʈ �ڵ鷯
     * @param {object} event
     */
    function onMessageCardClick(event) {
      var message = $scope.message;

      if (_isProfileImage(event)) {
        event.stopPropagation();
        jndPubSub.pub('onUserClick', $scope.writer);
      } else if (!message.preventRedirect) {
        if (message.type !== 'message') {
          // message type�� 'message'��� ���� scope���� handling��

          // message�� �ۼ��� ������ redirect
          _redirect(message, $scope.writer);
        }
      }
    }

    function _redirect(message, writer) {
      if (message.contentType === 'comment' && message.feedbackId > 0) {
        _goTo(function() {
          _goToFileDetail(message, writer);
        });
      } else {
        if (!entityAPIservice.isLeavedTopic(EntityMapManager.get('total', message.roomId), memberService.getMemberId())) {
          _goTo(function() {
            _goToTopic(message);
          });
        } else {
          alert($filter('translate')('@common-leaved-topic'));
        }
      }
    }

    function _goTo(fn) {
      messageAPIservice.getMessage($scope.messageData.teamId, $scope.message.id)
        .success(function(message) {
          if (message.status === 'created') {
            fn();
          } else {
            alert($filter('translate')('@common-removed-origin'));
          }
        })
        .error(function() {
          alert($filter('translate')('@common-leaved-topic'));
        });
    }

    function _goToFileDetail(message, writer) {
      $state.go($scope.message.type === 'message' ? 'files' : $scope.message.type + 's', {userName: writer.name, itemId: message.feedbackId});
    }

    function _goToTopic(message) {
      var toEntityId = message.roomId;
      var toLinkId = message.linkId;

      MessageQuery.setSearchLinkId(toLinkId);

      if (_isToEntityCurrent(toEntityId)) {
        jndPubSub.pub('jumpToMessageId');
      } else {
        $state.go('archives', {entityType: message.roomType + 's', entityId: toEntityId});
      }
    }

    function _isToEntityCurrent(toEntityId) {
      return currentSessionHelper.getCurrentEntity().id === toEntityId;
    }

    function _isProfileImage(event) {
      return /img/i.test(event.target.nodeName);
    }
  }
})();
