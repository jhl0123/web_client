/**
 * @fileoverview topic 관련 socket event를 처리한다.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketTopic', TopicSocket);

  /* @ngInject */
  function TopicSocket(jndPubSub, EntityHandler, memberService, jndWebSocketCommon, currentSessionHelper, RoomTopicList,
                       UserList) {
    var TOPIC_LEFT = 'topic_left';
    var TOPIC_JOINED = 'topic_joined';
    var TOPIC_DELETED = 'topic_deleted';
    var TOPIC_CREATED = 'topic_created';
    var TOPIC_UPDATED = 'topic_updated';
    var TOPIC_STARRED = 'topic_starred';
    var TOPIC_UNSTARRED = 'topic_unstarred';

    var ROOM_SUBSCRIBE = 'room_subscription_updated';

    var events = [
      {
        name: 'topic_invited',
        version: 1,
        handler: _onTopicInvited
      },
      {
        name: 'topic_kicked_out',
        version: 1,
        handler: _onTopicKickedOut
      },
      {
        name: 'topic_left',
        version: 1,
        handler: _onTopicLeft
      },
      {
        name: 'topic_joined',
        version: 1,
        handler: _onTopicJoined
      },
      {
        name: 'topic_deleted',
        version: 1,
        handler: _onTopicLDeleted
      },
      {
        name: 'topic_created',
        version: 1,
        handler: _onTopicLCreated
      },
      {
        name: 'topic_updated',
        version: 1,
        handler: _onTopicUpdated
      },
      {
        name: 'topic_starred',
        version: 1,
        handler: _.bind(_onTopicStarChanged, null, true)
      },
      {
        name: 'topic_unstarred',
        version: 1,
        handler: _.bind(_onTopicStarChanged, null, false)
      },
      {
        name: 'room_subscription_updated',
        version: 1,
        handler: _onTopicSubscriptionChanged
      }
    ];

    this.getEvents = getEvents;

    function getEvents() {
      return events;
    }

    /**
     * kickout 시 이벤트 핸들러
     * @param {object} socketEvent
     * @private
     */
    function _onTopicKickedOut(socketEvent) {
      var currentTeam;
      var roomId;

      _convertSocketEvent(socketEvent);

      currentTeam = currentSessionHelper.getCurrentTeam();
      roomId = socketEvent.room.id;
      
      if (currentTeam.id ===  socketEvent.teamId) {
        jndPubSub.pub('kickedOut', socketEvent);
        if (jndWebSocketCommon.isCurrentEntity({id: socketEvent.room.id})) {
          jndPubSub.toDefaultTopic();
        }
  
        if (RoomTopicList.isPublic(roomId)) {
          RoomTopicList.add(RoomTopicList.get(roomId), false);
        } else {
          RoomTopicList.remove(roomId);
        }

        jndPubSub.onChangeShared(socketEvent);
      }
    }

    /**
     * topic invited 이벤트 핸들러. 어느 사용자이건 topic 에 초대된 경우 발생한다.
     * @param {object} socketEvent
     * @private
     */
    function _onTopicInvited(socketEvent) {
      var topic = socketEvent.data.topic;
      //자기 자신에 대한 초대일 경우 add 를 수행한다.
      if (socketEvent.data.memberId === memberService.getMemberId()) {
        RoomTopicList.add(topic, true);
        jndPubSub.pub('jndWebSocketTopic:topicInvited:currentMember', socketEvent);
      } else {
        if (RoomTopicList.isExist(topic.id)) {
          RoomTopicList.extend(topic.id, topic);
        }
        jndPubSub.pub('jndWebSocketTopic:topicInvited:otherMember', socketEvent);
      }
    }

    /**
     * 'topic_left' EVENT HANDLER
     * 내가 토픽을 나갔을 때
     * @param {object} socketEvent - socket event parameter
     * @private
     */
    function _onTopicLeft(socketEvent) {
      _convertSocketEvent(socketEvent);

      var roomId = socketEvent.room.id;

      if (jndWebSocketCommon.isCurrentEntity(socketEvent.room)) {
        jndPubSub.toDefaultTopic();
      }

      RoomTopicList.unjoin(roomId);

      jndPubSub.onChangeShared(socketEvent);
    }

    /**
     * 'topic_joined' EVENT HANDLER
     * 내가 토픽에 join 했을 때
     * @param {object} socketEvent - socket event object
     * @private
     */
    function _onTopicJoined(socketEvent) {
      _convertSocketEvent(socketEvent);
      
      var user = socketEvent.member;
      var room = socketEvent.room;

      //message 소켓 이벤트 중 messageType 이 topic_join인 소켓 이벤트 발생 시점에 join 한 member 정보가 없을 수 있기 때문에
      //leftSideMenu request 실행 이전에 소켓 이벤트에 포함된 join 한 member 데이터 추가/업데이트를 먼저 수행한다.
      if (!UserList.isExist(user.id)) {
        UserList.add(user);
      }
      RoomTopicList.join(room.id);
      
      jndPubSub.onChangeShared(socketEvent);
    }

    /**
     * 'topic_deleted' EVENT HANDLER
     * @param {object} socketEvent - socket event parameter
     * @private
     */
    function _onTopicLDeleted(socketEvent) {
      _convertSocketEvent(socketEvent);
      var roomId = socketEvent.room.id;

      RoomTopicList.remove(roomId);
      jndPubSub.onChangeShared(socketEvent);

      jndPubSub.pub('topicDeleted', socketEvent);

      // topic 삭제시 file upload 중이라면 전부 취소하는 event를 broadcast함
      jndPubSub.pub('onFileUploadAllClear');
      if (jndWebSocketCommon.isCurrentEntity(socketEvent.room)) {
        jndPubSub.toDefaultTopic();
      }
    }

    /**
     * 'topic_created' EVENT HANDLER
     * @param {object} socketEvent - socket event parameter
     * @private
     */
    function _onTopicLCreated(socketEvent) {
      var room;
      _convertSocketEvent(socketEvent);
      room = socketEvent.room;
      RoomTopicList.add(room, _isJoinedTopic(room));
      jndPubSub.onChangeShared(socketEvent);
    }

    /**
     * room 의 member field 를 참조하여, 현재 사용자가 가입한 room 인지 여부를 반환한다.
     * @param {object} room
     * @returns {boolean}
     * @private
     */
    function _isJoinedTopic(room) {
      var memberId = memberService.getMemberId();
      return room.members.indexOf(memberId) !== -1;
    }
    /**
     * 'topic_updated' EVENT HANDLER
     * @param {object} socketEvent - socket event parameter
     * @private
     */
    function _onTopicUpdated(socketEvent) {
      var room;

      _convertSocketEvent(socketEvent);

      room = socketEvent.room;
      EntityHandler.extend(room.id, room);
      jndPubSub.pub('webSocketTopic:topicUpdated', socketEvent.room);
    }

    /**
     * 'room_subscribe' EVENT HANDLER
     * @param {object} socketEvent - socket event parameter
     * @private
     */
    function _onTopicSubscriptionChanged(socketEvent) {
      _convertSocketEvent(socketEvent);

      memberService.setTopicNotificationStatus(socketEvent.room.id, socketEvent.data.subscribe);
      jndPubSub.pub('onTopicSubscriptionChanged', socketEvent);
    }

    /**
     * 'topic_starred', 'topic_unstarred' EVENT HANDLER
     * @param {boolean} isStarred
     * @param {object} socketEvent - socket event parameter
     * @private
     */
    function _onTopicStarChanged(isStarred, socketEvent) {
      _convertSocketEvent(socketEvent);

      jndPubSub.pub('TopicSocket:starChanged', _.extend(socketEvent.room, {
        isStarred: isStarred
      }));
    }

    /**
     * 'socketEvent' object를 broadcast의 인자로 전달하기 위해 가공함
     * @param {object} socketEvent
     * @private
     */
    function _convertSocketEvent(socketEvent) {
      if (socketEvent.data) {
        // topic_kicked_out 이벤트 경우 다른 이벤트 오브젝트의 포멧이 다르므로 같게 맞춰준다
        socketEvent.room = {
          id: socketEvent.data.roomId
        };
        socketEvent.teamId = socketEvent.data.teamId;
      }

      if (socketEvent.topic) {
        socketEvent.room = socketEvent.topic;
        delete socketEvent.topic;
      }
    }
  }
})();
