(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketMessage', jndWebSocketMessage);

  /* @ngInject */
  function jndWebSocketMessage(jndWebSocketCommon, jndPubSub, memberService, currentSessionHelper, ActiveNotifier, RoomTopicList,
                               MessageNotification, MentionNotification, FileShareNotification, TopicInviteNotification) {

    var MESSAGE = 'message';

    var MESSAGE_STARRED = 'message_starred';
    var MESSAGE_UNSTARRED = 'message_unstarred';

    var events = [
      {
        name: MESSAGE,
        version: 1,
        handler: _onMessage
      },
      {
        name: MESSAGE_STARRED,
        version: 1,
        handler: _onMessageStarred
      },
      {
        name: MESSAGE_UNSTARRED,
        version: 1,
        handler: _onMessageUnStarred
      }
    ];

    this.getEvents = getEvents;

    function getEvents() {
      return events;
    }

    /**
     * starred message 이벤트 핸들러
     * @param {object} socketEvent
     * @private
     */
    function _onMessageStarred(socketEvent) {
      var data = socketEvent.data;

      if (parseInt(memberService.getMemberId(), 10) === parseInt(data.memberId, 10)) {
        jndPubSub.pub('message:starred', data);
      }
    }

    /**
     * unStarred message 이벤트 핸들러
     * @param {object} socketEvent
     * @private
     */
    function _onMessageUnStarred(socketEvent) {
      var data = socketEvent.data;
      if (parseInt(memberService.getMemberId(), 10) === parseInt(data.memberId, 10)) {
        jndPubSub.pub('message:unStarred', data);
      }
    }

    function _onMessage(data) {
      var messageType = data.messageType || 'new_message';

      switch (messageType) {
        case 'file_comment':
          _onFileComment(data);
          break;
        case 'topic_leave':
          _onTopicLeave(data);
          break;
        case 'topic_join':
          _onTopicJoin(data);
          break;
        case 'file_share':
          _onFileShared(data);
          _onTopicFileShareStatusChange(data);
          break;
        case 'file_unshare':
          _onTopicFileShareStatusChange(data);
          break;
        case 'message_delete':
          _onMessageDelete(data);
          break;
        case 'topic_invite':
          _onTopicInvited(data);
          _onNewMessage(data);
          break;
        case 'new_message':
        default:
          _onNewMessage(data);
          break;
      }
    }

    /**
     * message -> file_comment event handler.
     * 코멘트가 달린 파일이 공유된 방중에 현재 보고있는 엔티티가 있다면 center만 업데이트한다.
     * right panel update는 file_comment_created 에서.
     * @param {object} data
     * @private
     */
    function _onFileComment(data) {
      var room;
      var map = {};

      _.forEach(data.rooms, function(room) {
        if (jndWebSocketCommon.isCurrentEntity(room)) {
          // 현재 해당 room을 보고 있는경우
          jndPubSub.updateCenterPanel();
        }
      });

      if (room = jndWebSocketCommon.getNotificationRoom(data.rooms)) {
       data.room = room;
        if (_hasMention(data)) {
          _sendMentionNotification(data);
        } else {
          _sendBrowserNotification(data, true);
        }
      }
    }

    /**
     * message -> topic_leave event handler.
     * 누군가가 현재 topic을 나갔다면 센터를 업데이트한다.
     * 누군가가 어떤 topic을 나갔든지 left를 업데이트해서 해당하는 토픽의 정보를 갱신한다.
     * @param {object} socketEvent
     * @private
     */
    function _onTopicLeave(socketEvent) {
      var room = socketEvent.room;
      if (jndWebSocketCommon.isCurrentEntity(room)) {
        jndPubSub.updateCenterPanel();
      }
      RoomTopicList.removeMember(socketEvent.room.id, socketEvent.writer);
      jndPubSub.pub('jndWebSocketMessage:topicLeave', socketEvent);
    }

    /**
     * Topic join 이벤트 핸들러
     * @param {object} socketEvent
     * @private
     */
    function _onTopicJoin(socketEvent) {
      var room = socketEvent.room;
      if (jndWebSocketCommon.isCurrentEntity(room)) {
        jndPubSub.updateCenterPanel();
      }
      RoomTopicList.addMember(socketEvent.room.id, socketEvent.writer);
      jndPubSub.pub('jndWebSocketMessage:topicJoin', socketEvent);
    }

    /**
     * message -> file_share 일때
     * @param {object} data - socket event parameter
     * @private
     */
    function _onFileShared(data) {
      var room = data.room;

      if (jndWebSocketCommon.isChatType(room)) {
        // 1:1 dm일 경우에는 _onDm이 handle하게 놔둔다.
        _onDm(data);
      } else if (_shouldSendNotification(data)) {
        if (memberService.isTopicNotificationOn(room.id)) {
          FileShareNotification.show(data, jndWebSocketCommon.getRoom(data.room));
        }
        //내가 share 했을 경우 공유한 토픽의 marker 위치를 업데이트 해야하기 때문에 부득이하게 leftSideMenu 를 콜한다.
        if (jndWebSocketCommon.isActionFromMe(data.writer)) {
          //linkId 정보가 존재한다면, 나의 unreadMarker를 내부적으로 갱신 할 수 있으나,
          //현재 linkId 정보가 없으므로 leftSideMenu 를 호출한다.
          //TODO: 백엔드 message_created 소켓 이벤트 작업 이후 leftPanel update 제거해야 함.
          jndPubSub.updateLeftPanel();
        } else {
          jndWebSocketCommon.increaseBadgeCount(room.id);
        }
      }
    }

    /**
     * 현재 보고 있는 토픽에 일어난 이벤트에만 센터를 업데이트한다.
     * @param data
     * @private
     */
    function _onTopicFileShareStatusChange(data) {

      // 현재 토픽이라면 센터를 업데이트하고 아니라면 왼쪽을 업데이트한다
      if (jndWebSocketCommon.isCurrentEntity(data.room)) {
        jndPubSub.updateCenterPanel();
      }

      _updateRight(data);
    }

    /**
     * 누군가가 누군가를 토픽에 초대했을 경우 발생된다.
     * @param {object} socketEvent - socket event parameter
     * @private
     */
    function _onTopicInvited(socketEvent) {
      if (jndWebSocketCommon.hasMyId(socketEvent.inviter)) {
        if (_shouldSendNotification(socketEvent)) {
          TopicInviteNotification.show(socketEvent);
        }
      }
    }

    /**
     * message가 삭제되었을 때 현재 토픽이면 업데이트한다.
     * @param {object} socketEvent
     * @private
     */
    function _onMessageDelete(socketEvent) {
      var room = socketEvent.room;
      if (!jndWebSocketCommon.isCurrentEntity(room) || !ActiveNotifier.getStatus()) {
        _updateBadgeCount(socketEvent);
      }
      jndPubSub.pub('jndWebSocketMessage:messageDeleted', socketEvent);
    }

    /**
     * 새로운 메세지가 작성되었을 경우
     * @param data
     * @private
     */
    function _onNewMessage(data) {
      var room = data.room;
      var linkId = data.linkId;
      
      if (_isDmToMe(data)) {
        _onDm(data);
      } else {
        _onTopic(data);
      }

      if (jndWebSocketCommon.isActionFromMe(data.writer)) {
        jndWebSocketCommon.updateMyLastMessageMarker(room.id, linkId);
      }

    }

    /**
     * 1:1 direct message가 왔을 경우
     * @param socketEvent
     * @private
     */
    function _onDm(socketEvent) {
      var room = socketEvent.room;
      room.extWriterId = socketEvent.writer;

      if (jndWebSocketCommon.isCurrentEntity(room)) {
        jndPubSub.updateCenterPanel();
      }

      jndPubSub.pub('updateChatList');
      if (socketEvent.messageType === 'file_share') {
        _updateRight(socketEvent);

        // file_share일 경우
        if (!jndWebSocketCommon.isActionFromMe(socketEvent.room.extWriterId)) {
          // 내가 보낸 file_share가 아닌 경우에만 노티를 보낸다.
          FileShareNotification.show(socketEvent, jndWebSocketCommon.getRoom(socketEvent.room));
        }
      } else {
        _sendBrowserNotification(socketEvent);
      }
    }

    /**
     * 토픽으로 새로운 메세지가 왔을 경우
     * @param socketEvent
     * @private
     */
    function _onTopic(socketEvent) {
      var room = socketEvent.room;
      if (jndWebSocketCommon.isCurrentEntity(room)) {
        jndPubSub.updateCenterPanel();

        //inactive 라면 badge count 를 올린다.
        if (!ActiveNotifier.getStatus()) {
          _updateBadgeCount(socketEvent);
        }
      } else {
        _updateBadgeCount(socketEvent);
      }

      if (_hasMention(socketEvent)) {
        _sendMentionNotification(socketEvent);
      } else if (memberService.isTopicNotificationOn(socketEvent.room.id)) {
        _sendBrowserNotification(socketEvent);
      }
    }

    /**
     * API 콜 없이 뱃지 카운트를 처리할 수 있는 message 이벤트의 경우 내부 로직을 활용하여 뱃지 카운트를 업데이트 한다.
     * @param {object} socketEvent
     * @returns {boolean} 뱃지 카운트를 업데이트 처리 했는지 여부
     * @private
     */
    function _updateBadgeCount(socketEvent) {
      var room = socketEvent.room;
      var returnVal = false;
      //내부적으로 뱃지 카운트를 처리할 수 있는 경우에는 API 콜을 하지 않는다.
      //ex) 일반 메시지, 스티커, 파일 업로드
      if (socketEvent.messageType === 'message_delete') {
        //TODO: http://its.tosslab.com/browse/BD-326 완료 이후 linkId 로 계산 할 수 있도록 수정 필요
        if (memberService.isUnreadMessage(room.id, socketEvent.linkId)) {
          jndWebSocketCommon.decreaseBadgeCount(room.id);
        }
      } else if (!socketEvent.messageType) {
        if (jndWebSocketCommon.isActionFromMe(socketEvent.writer)) {
          jndWebSocketCommon.updateMyLastMessageMarker(room.id, socketEvent.linkId);
        } else {
          jndWebSocketCommon.increaseBadgeCount(room.id);
        }
      }
    }

    /**
     * 나에대한 mention이 있는지 없는지 확인한다.
     * @param data
     * @returns {boolean}
     * @private
     */
    function _hasMention(data) {
      var mentionList = data.mentions;
      var foundMentionToMe = false;
      _.each(mentionList, function(mentionObj) {
        if (mentionObj.id === memberService.getMemberId()) {
          foundMentionToMe = true;
          return false;
        }
      });
      return foundMentionToMe;
    }
    /**
     * right panel에 update 정보를 전달한다.
     * @param data
     * @private
     */
    function _updateRight(data) {
      jndPubSub.pub('onChangeShared', data);
    }

    /**
     * 나에게 1:1 메세지가 온 것인지 아닌지 확인한다.
     * @param data
     * @returns {boolean}
     * @private
     */
    function _isDmToMe(data) {
      var room = data.room;
      var myId = memberService.getMemberId();
      var foundMyself = false;
      var memberList;

      if (room.type === 'chat') {
        memberList = room.members;
        if (!!memberList && memberList.length > 0) {
          _.forEach(memberList, function(memberId) {
            if (memberId === myId) {
              foundMyself = true;
              return false;
            }
          });
        }
      }
      return foundMyself;
    }

    /**
     * browser notification을 보낸다.
     * @param data
     * @private
     */
    function _sendBrowserNotification(data, isFileComment) {
      if (_shouldSendNotification(data)) {
        MessageNotification.show(data, jndWebSocketCommon.getActionOwner(data.writer), jndWebSocketCommon.getRoom(data.room), !!isFileComment);
      }
    }

    /**
     * mention용 browser notification을 보낸다.
     * @param {object} data - message socket event를 통해서 들어온 data
     * @private
     */
    function _sendMentionNotification(data) {
      jndPubSub.pub('jndWebSocketMessage:mentionNotificationSend', data);

      if (_shouldSendNotification(data)) {
        MentionNotification.show(data, jndWebSocketCommon.getActionOwner(data.writer), jndWebSocketCommon.getRoom(data.room));
      }
    }

    /**
     * 노티피케이션을 보내야하는 상황인지 아닌지 확인한다.
     * @param {object} data - socket event parameter
     * @returns {boolean}
     * @private
     */
    function _shouldSendNotification(data) {
      var returnVal = true;

      if (jndWebSocketCommon.isActionFromMe(data.writer)) {
        // 내가 보낸 노티일 경우
        returnVal = false;
      }

      if (jndWebSocketCommon.isCurrentEntity(data.room) && !currentSessionHelper.isBrowserHidden()) {
        // 현재 보고있는 토픽에 노티가 왔는데 브라우져가 focus를 가지고 있을 때
        returnVal = false;
      }
      return returnVal;
    }

  }
})();
