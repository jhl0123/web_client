(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketCommon', jndWebSocketCommon);

  /* @ngInject */
  function jndWebSocketCommon(CoreUtil, jndPubSub, currentSessionHelper, entityAPIservice, EntityHandler, UserList, logger,
                              memberService, accountService, RoomTopicList) {

    var _chatEntity = 'chat';


    this.isCurrentEntity = isCurrentEntity;
    this.isChatType = isChatType;
    this.getActionOwner = getActionOwner;
    this.getRoom = getRoom;

    this.updateLeft = updateLeft;

    this.updateFileDetailPanel = updateFileDetailPanel;
    this.isActionFromMe = isActionFromMe;
    this.hasMyId = hasMyId;

    this.getLastLinkId = getLastLinkId;

    this.shouldSendNotification = shouldSendNotification;
    this.getTeamId = getTeamId;

    this.getNotificationRoom = getNotificationRoom;
    this.increaseBadgeCount = increaseBadgeCount;
    this.decreaseBadgeCount = decreaseBadgeCount;

    this.updateMyLastMessageMarker = updateMyLastMessageMarker;
    
    function updateLeft() {
      jndPubSub.updateLeftPanel();
    }

    /**
     * Check whether id of current entity(actively looking) is same as room.
     * @param room {object}
     *  @param type {string} type of room
     *  @param id {number} id of room
     * @returns {boolean}
     * @private
     */
    function isCurrentEntity(room) {
      var roomId = +room.id;
      var currentEntity = currentSessionHelper.getCurrentEntity();

      if (isChatType(room)) {
        // dm일 경우
        if (room.extWriterId) {
          // 방에 작성자 정보가 있을 경우
          if (memberService.isJandiBot(currentEntity.id)) {
            return roomId === currentEntity.entityId;
          } else {
            return room.extWriterId === currentEntity.id || isActionFromMe(room.extWriterId);
          }
        } else {
          return roomId === currentEntity.entityId;
        }
      } else {
        return roomId === currentEntity.id;
      }
    }

    /**
     * badge count 를 증가시킨다.
     * @param {number} roomId
     * @param {number} [count=1]
     */
    function increaseBadgeCount(roomId, count) {
      var entity = EntityHandler.get(roomId);

      if (entity && !isCurrentEntity(entity)) {
        entityAPIservice.increaseBadgeCount(entity.id, count);
      }
    }

    /**
     * badge count 를 감소시킨다.
     * @param {number} roomId
     * @param {number} [count=1]
     */
    function decreaseBadgeCount(roomId, count) {
      var entity = EntityHandler.get(roomId);

      if (!isCurrentEntity(entity)) {
        entityAPIservice.decreaseBadgeCount(entity.id, count);
      }
    }

    /**
     * 현재 사용자의 room 에 대한 read message marker 를 갱신한다.
     * @param {number} roomId
     * @param {number} linkId
     */
    function updateMyLastMessageMarker(roomId, linkId) {
      var room = EntityHandler.get(roomId);
      if (room) {
        memberService.setLastReadMessageMarker(room.id, linkId);
        entityAPIservice.updateBadgeValue(room, 0);
      }
    }
    
    /**
     * 'chat' type인지 아닌지 확인한다.
     * @param {object} room - room object inside of socket event parameter
     * @returns {*}
     */
    function isChatType(room) {
      if (room.room) {
        // parameter가 방이 아니라 소켓이벤트였을 경우
        return isChatType(room.room);
      }

      return room.type === _chatEntity;
    }

    /**
     * 나와 상관있는 방에서 소켓이벤트가 일어났다면 true를 리턴한다.
     * Check if event has any effect on any related topics.
     * What are related topics?
     *   - joined public topic
     *   - joined private topic
     *   - 1:1 message
     * @param roomEntity {object} entity
     * @param writer {object} socket event owner
     * @returns {boolean}
     * @private
     */
    function isRelatedEvent(roomEntity, writer) {
      if (_.isUndefined(roomEntity) || _.isUndefined(writer)) {
        logger.log('not related room event');
        return false;
      }
      logger.log('related room event');
      return true;
    }

    /**
     * Return member entity whose id is 'writerId'.
     * @param writerId
     * @returns {*}
     * @private
     */
    function getActionOwner(writerId) {
      return UserList.get(writerId);
    }

    /**
     * Return entity whose id is room.id.
     * @param room {object}
     *  @param type {string} type of room
     *  @param id {number} id of room
     * @returns {object} room entity
     * @private
     */
    function getRoom(room) {
      var entity = EntityHandler.get(room.id);
      //DM 일 경우 해당 chat room 의 member 정보를 반환해야 한다.
      return CoreUtil.pick(entity, 'extMember') || entity;
    }

    /**
     * file detail panel을 업데이트한다.
     * @private
     */
    function updateFileDetailPanel() {
      logger.log('update file detail panel');
      jndPubSub.updateRightFileDetailPanel();
    }

    /**
     * writerId가 내 자신 아이디과 같은지 확인한다.
     * Check if writerId is same as id of currently signed in member(myself).
     * @param writerId {number} id of socket event owner
     * @returns {boolean}
     * @private
     */
    function isActionFromMe(writerId) {
      return writerId === memberService.getMemberId();
    }

    /**
     * parameter로 들어온 어레이에 나의 아이디가 있는지 없는지 확인한다.
     * @param {array} array - array to look for my id
     * @returns {boolean}
     */
    function hasMyId(array) {
      var foundMyself = false;
      _.forEach(array, function(memberId) {
        if (isActionFromMe(memberId)) {
          foundMyself = true;
          return false;
        }
      });

      return foundMyself;
    }

    function hasLastLinkId(socketEvent) {

    }

    /**
     * object에 'lastLinkId'나 'linkId'라는 property가 있는지 없는지 확인하고 있으면 값까지 리턴한다.
     * @param {object} object - 어떠한 오브젝트가 될 수 있음
     * @returns {{hasFound: boolean, value: number}}
     * @private
     */
    function _findLastLinkId(object) {
      var found = false;
      var returnObj = {
        hasFound: false,
        value: -1
      };

      if (_.isUndefined(object)) {
        return returnObj;
      }

      found = _.has(object, 'lastLinkId') || _.has(object, 'linkId');

      if (!found) {
        _.each(object, function(property) {
          if (_.isObject(property)) {
            returnObj = _findLastLinkId(property)
          }
        });
      } else {
        returnObj.value = _.get(object, 'lastLinkId') || _.get(object, 'linkId');
        returnObj.hasFound = found;
      }

      return returnObj;
    }

    /**
     * socketEvent에서 'lastLinkId'나 'linkId'를 찾아서 리턴한다.
     * @param {object} socketEvent - socket parameter
     * @returns {{hasFound: boolean, value: number}}
     */
    function getLastLinkId(socketEvent) {
      return _findLastLinkId(socketEvent);
    }

    /**
     * 노티피케이션을 보내야하는 상황인지 아닌지 확인한다.
     * @param {object} writer - 노티를 보낸 사람
     * @param {boolean} isCurrentEntity - 현재 엔티티인지 아닌지 알려주는 flag
     * @returns {boolean}
     * @private
     */
    function shouldSendNotification(data) {
      var returnVal = true;

      if (isSocketEventFromMe(data)) {
        // 내가 보낸 노티일 경우
        returnVal = false;
      }

      if (isCurrentEntity(data.room) && !currentSessionHelper.isBrowserHidden()) {
        // 현재 보고있는 토픽에 노티가 왔는데 브라우져가 focus를 가지고 있을 때
        returnVal = false;
      }

      return returnVal;
    }

    /**
     * socketEvent가 나로부터 온 이벤트인지 아닌지 확인한다.
     * @param {object} socketEvent - socket event parameter
     * @returns {boolean}
     */
    function isSocketEventFromMe(socketEvent) {
      var _teamId = getTeamId(socketEvent);
      var _writer = socketEvent.writer;

      return _teamId > 0 && accountService.getMemberId(_teamId) === _writer;
    }

    /**
     * 들어온 소켓이벤트에서 teamId 값을 추출한다.(멍청한 방법으로)
     * @param {object} socketEvent - socket event parameter
     * @returns {number}
     * @private
     */
    function getTeamId(socketEvent) {
      var _teamId = -1;

      if (socketEvent.teamId) {
        _teamId = socketEvent.teamId;
      } else if (socketEvent.team && socketEvent.team.id) {
        _teamId = socketEvent.team.id;
      } else if (socketEvent.data && socketEvent.data.teamId && socketEvent.data.teamId) {
        _teamId = socketEvent.data.teamId;
      } else if (socketEvent.data && socketEvent.data.message && socketEvent.data.message.teamId) {
        _teamId = socketEvent.data.message.teamId;
      } else if (socketEvent.data && socketEvent.data.bot && socketEvent.data.bot.teamId) {
        _teamId = socketEvent.data.bot.teamId;
      }

      return _teamId;
    }

    /**
     * notification해야 하는 room을 전달한다.
     * @param {array} rooms
     * @returns {*}
     */
    function getNotificationRoom(rooms) {
      var currentMemberId = memberService.getMemberId();
      var notificationRoom;

      _.forEach(rooms, function(room) {
        if ((RoomTopicList.isJoined(room.id) && memberService.isTopicNotificationOn(room.id)) ||
          (room.type === 'chat' && _.indexOf(room.members, currentMemberId) > -1)) {
          // 생성된 room이 존재하고 알림이 활성화 되어있는 경우 또는 DM이고 DM의 member인 경우

          notificationRoom = room;

          return false;
        }
      });

      return notificationRoom;
    }
  }
})();
