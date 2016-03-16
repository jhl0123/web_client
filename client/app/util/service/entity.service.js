(function(){
  'use strict';

  angular
    .module('jandiApp')
    .factory('entityAPIservice', entityAPIservice);

  /* @ngInject */
  function entityAPIservice($rootScope, $filter, EntityMapManager, $state, $window, storageAPIservice, jndPubSub,
                            currentSessionHelper, HybridAppHelper, NotificationManager, EntityHandler, BotList, UserList,
                            RoomTopicList, RoomChatDmList) {
    var service = {
      getEntityFromListByEntityId: getEntityFromListByEntityId,
      getEntityById: getEntityById,
      getJoinedEntity: getJoinedEntity,
      setCurrentEntityWithTypeAndId: setCurrentEntityWithTypeAndId,
      setCurrentEntity: setCurrentEntity,
      getCreatorId: getCreatorId,
      setStarred: setStarred,

      updateBadgeValue: updateBadgeValue,
      setLastEntityState: setLastEntityState,
      getLastEntityState: getLastEntityState,
      removeLastEntityState: removeLastEntityState,
      isDefaultTopic: isDefaultTopic,
      isOwner: isOwner,
      getEntityByEntityId: getEntityByEntityId,
      extend: extend,
      isPublicTopic: RoomTopicList.isPublic,
      isPrivateTopic: RoomTopicList.isPrivate,
      isJoinedTopic: isJoinedTopic,
      isDM: isDM,

      getMemberList: getMemberList,
      getUserList: getUserList,
      getUserLength: getUserLength,
      isUser: isUser,
      getBotList: getBotList,
      getJandiBot: getJandiBot,
      isLeavedTopic: isLeavedTopic,
      getOwnerId: getOwnerId,

      addBot: addBot,
      updateBot: updateBot,

      increaseBadgeCount: increaseBadgeCount,
      decreaseBadgeCount: decreaseBadgeCount,

      createTotalData: createTotalData
    };

    var _jandiBot;

    return service;

    /**
     * Takes 'entityId' from entity as an 'entityId'
     * Used to compare with chat room.
     *
     * @param list
     * @param entityId
     * @returns {*}
     */
    function getEntityFromListByEntityId(list, entityId) {
      entityId = parseInt(entityId, 10);
      if ($rootScope.member && $rootScope.member.id === entityId) return $rootScope.member;

      return getEntityByEntityId(entityId);
    }

    /**
     * If entityType is 'channel', look for entityId only in 'joinedChannelList'.
     * So non-joined topic will be found.
     *
     * @param entityType
     * @param entityId
     * @returns {*}
     */
    function getEntityById(entityType, entityId) {
      var entity;
      entityType = entityType.toLowerCase();

      switch (entityType) {
        case 'privategroup':
        case 'privategroups':
        case 'channel':
        case 'channels':
          entity = RoomTopicList.get(entityId);
          break;
        case 'user':
        case 'users':
          entity = UserList.get(entityId);
          break;
        default:
          entity = EntityHandler.get(entityId);

          break;
      }

      return entity;
    }

    /**
     * 참여중인 entity를 entityId로 전달한다.
     * @param {number|string} entityId
     * @returns {*|Object}
     */
    function getJoinedEntity(entityId) {
      return EntityHandler.get(entityId);
    }

    /**
     * 본인 entity 인지 여부를 반환한다.
     * @param {String} entityType
     * @param {number|string} entityId
     * @returns {boolean} 본인 entity 인지 여부
     * @private
     */
    function _isMe(entityType, entityId) {
      entityId = parseInt(entityId, 10);
      return !!(entityType.indexOf('user') > -1 && $rootScope.member && $rootScope.member.id === entityId);
    }

    function setCurrentEntityWithTypeAndId(entityType, entityId) {
      var currentEntity;
      if (!_.isUndefined(entityId)) {
        currentEntity = EntityMapManager.get('total', entityId);
      }
      if (!_.isUndefined(currentEntity)) {
        setCurrentEntity(currentEntity);
      }
    }
    //  return null if 'getEntityById' return nothing.
    function setCurrentEntity (currentEntity) {
      currentEntity.alarmCnt = '';
      HybridAppHelper.onAlarmCntChanged(currentEntity.id, 0);
      NotificationManager.remove(currentEntity);

      currentSessionHelper.setCurrentEntity(currentEntity);
      jndPubSub.pub('onCurrentEntityChanged', currentEntity);
    }

    /**
     * 생성자의 아이디를 리턴한다.
     * @param {object} entity - 생성자를 알고 싶은 토픽(1:1DM이 될 수도 있음).
     * @returns {*}
     */
    function getCreatorId (entity) {
      if (entity.type === 'users') return null;

      if (entity.type === 'privateGroup' || entity.type === 'privategroup') {
        return entity.pg_creatorId;
      }
      return entity.ch_creatorId;
    }

    /**
     * 해당하는 아이디를 가진 토픽(혹은 dm)을 'starred' 처리한다.
     * @param {number} entityId - star처리 할 토픽(혹은 dm)의 아이디
     */
    function setStarred (entityId) {
      var entity = EntityMapManager.get('total', entityId);
      if (!_.isUndefined(entity)) {
        entity.isStarred = true;
      }
    }

    /**
     * badge 정보를 가진 entity 를 반환한다.
     * @param {object} entityId
     * @returns {*}
     * @private
     */
    function _getBadgeEntity(entityId) {
      var entity = EntityHandler.get(entityId);
      return entity && (entity.extMember || entity);
    }

    /**
     * entity 의 badge count 를 증가한다.
     * @param {number} roomId
     * @param {number} [count=1]
     */
    function increaseBadgeCount(roomId, count) {
      var entity = _getBadgeEntity(roomId);
      count = count || 1;

      var alarmCnt = entity.alarmCnt || 0;

      updateBadgeValue(entity, alarmCnt + count);
    }

    /**
     * entity 의 badge count 를 감소한다.
     * @param {number} roomId
     * @param {number} [count=1]
     */
    function decreaseBadgeCount(roomId, count) {
      var entity = _getBadgeEntity(roomId);
      count = count || 1;

      var alarmCnt = (entity.alarmCnt || 0) - count;
      if (alarmCnt < 0) {
        alarmCnt = 0;
      }
      updateBadgeValue(entity, alarmCnt);
    }


    /**
     * updating alarmCnt field of 'entity' to 'alarmCount'.
     * 'alarmCount' is -1, it means to increment.
     * @param {object} entity
     * @param {number} alarmCount
     */
    function updateBadgeValue (entity, alarmCount) {
      _setBadgeValue(entity, alarmCount);
      NotificationManager.set(entity, alarmCount);
      jndPubSub.pub('badgeCountChange', {
        entity: entity,
        count: alarmCount
      });
    }

    /**
     * badgeValue 를 업데이트 한다.
     * @private
     * @param entity
     * @param alarmCount
     * TODO: EXPLAIN THE SITUATION WHEN 'alarmCount' is 0.
     */
    function _setBadgeValue (entity, alarmCount) {
      var curEntity = EntityMapManager.get('total', entity.id);
      if (curEntity) {
        if (alarmCount == -1) {
          if (angular.isUndefined(curEntity.alarmCnt)) {
            curEntity.alarmCnt = 1;
          } else {
            curEntity.alarmCnt++;
          }
          HybridAppHelper.onAlarmCntChanged(entity.id, curEntity.alarmCnt);
        } else {
          curEntity.alarmCnt = alarmCount;
          HybridAppHelper.onAlarmCntChanged(entity.id, alarmCount);
        }
        jndPubSub.pub('badgeCountChange', {
          entity: entity,
          count: alarmCount
        });
      }
    }



    /**
     *
     *  Setting/Getting/Removing 'last-state' from/to localStorage.
     *
     */
    function setLastEntityState () {
      var last_state = {
        rpanel_visible  : $state.current.name.indexOf('file') > -1 ? true : false,
        entityId        : $state.params.entityId,
        entityType      : $state.params.entityType,
        itemId          : $state.params.itemId,
        userId          : $window.sessionStorage.userId
      };

      if (last_state.entityId == null) return;

      storageAPIservice.setLastStateLocal(last_state);
    }
    function getLastEntityState () {
      var last_state = storageAPIservice.getLastStateLocal();

      if (!last_state || last_state.entityId == null) return null;

      return last_state;
    }
    function removeLastEntityState () {
      storageAPIservice.removeLastStateLocal();
    }

    /**
     * 토픽(혹은 dm)이 현재 팀의 default topic 인지 아닌지 확인한다.
     * @param {object} entity - 확인하고자하는 토픽
     * @returns {boolean}
     */
    function isDefaultTopic(entity) {
      return entity.id == currentSessionHelper.getDefaultTopicId();
    }

    /**
     * 토픽(혹은 dm)의 생성자인지 아닌지 확인한다.
     * @param {object} entity - 확인하고자하는 토픽
     * @param {number} memberId - 확인하고자하는 유저의 아이디
     * @returns {boolean}
     */
    function isOwner(entity, memberId) {
      return (entity.creatorId || entity.ch_creatorId || entity.pg_creatorId) == memberId;
    }

    /**
     * 토픽(혹은 dm)의 생성자 id 를 반환한다
     * @param {object} entity
     * @returns {*}
     */
    function getOwnerId(entity) {
      return (entity.creatorId || entity.ch_creatorId || entity.pg_creatorId);
    }

    /**
     * 'entityId'를 이용하여 member entity 를 찾아 리턴한다.
     * 그러므로
     *  1. 'entityId'를 사용할때만
     *  2. member entity 를 찾으려 할때만
     * 사용해야 한다.
     * @param {*} entityId - entityId to be searched
     * @returns {object} entity - member entity
     */
    function getEntityByEntityId(entityId) {
      return EntityMapManager.get('memberEntityId', entityId);
    }

    /**
     * _.extend 와 같은 일을 하지만 source 의 type을 소문자로 바꾼 후 복수형으로 바꾼 다음 extend를 한다.
     * @param target
     * @param source
     */
    function extend(target, source) {
      if (!!source.type) {
        source.type = source.type.toLowerCase() + 's';
      }
      _.extend(target, source);
    }

    /**
     * 조인되어있는 토픽(공개/비공개)인지 알아본다.
     * @param {object} entity - 알아보고 싶은 토픽
     * @returns {boolean}
     */
    function isJoinedTopic(entity) {
      return !!RoomTopicList.get(entity.id, true);
    }

    /**
     * 조인되어있는 DM인지 알아본다.
     * @param entity
     * @returns {*|boolean|*}
     */
    function isDM(entity) {
      return !!RoomChatDmList.get(entity.id);
    }

    /**
     * entity의 type에따라 맞는 member array를 넘겨준다.
     * @param entity
     * @returns {array} memberList
     */
    function getMemberList(entity) {
      //@fixme: indexOf 대신 일치 연산자를 사용해야 함.
      return entity.type.indexOf('channel') !== -1 ? entity.ch_members : entity.pg_members;
    }

    /**
     * entity의 user list를 전달한다.
     * @param {object} entity
     * @returns {Array}
     */
    function getUserList(entity) {
      var list = [];
      var memberList = getMemberList(entity);
      _.forEach(memberList, function(memberId) {
        if (UserList.get(memberId)) {
          list.push(memberId);
        }
      });
      return list;
    }

    /**
     * Returns number of member in entity including myself.
     * @param entity {entity}
     * @returns {number} number of member in 'entity'
     */
    function getUserLength(entity) {
      var length = -1;
      if (entity != null && entity.type.indexOf('user') === -1) {
        length = getUserList(entity).length;
      }
      return length;
    }

    /**
     * Returns true is 'user' is a member of 'entity'
     * @param {object} entity
     * @param {object} user
     * @returns {boolean}
     */
    function isUser(entity, user) {
      var users = getUserList(entity);
      return _.indexOf(users, user.id) > -1;
    }

    /**
     * bot list를 전달한다.
     * @returns {Array}
     */
    function getBotList() {
      return BotList.toJSON();
    }

    /**
     * jandi bot을 전달한다.
     */
    function getJandiBot() {
      return BotList.getJandiBot();
    }

    /**
     * set jandi bot
     * @param {object} bot
     * @private
     */
    function _setJandiBot(bot) {
      _jandiBot = bot;
    }

    /**
     * topic에 포함되지 않은 member인지 여부
     * @param {object} topic
     * @param {number} memberId
     * @returns {boolean}
     */
    function isLeavedTopic(entity, memberId) {
      var result = false;
      var members;
      
      if (entity) {
        members = getMemberList(entity);
        if (members && members.indexOf(memberId) < 0) {
          result = true;
        }
      } else {
        result = true;
      }

      return result;
    }

    /**
     * client에서 사용할 모든 entity data를 생성한다.
     * @param {object} response
     * @returns {{joinedChannelList: Array, privateGroupList: Array, unJoinedChannelList: Array}}
     */
    function createTotalData(response) {
      EntityHandler.parseLeftSideMenuData(response);

      var totalEntities = response.entities;
      var joinedEntities = response.joinEntities;
      var bots = response.bots;

      var joinedChannelList = [];
      var privateGroupList = [];
      var unJoinedChannelList = [];

      //EntityMapManager.resetAll();

      _createEntityData(joinedEntities, function(entity, type) {
        if (type === 'channel') {
          //EntityMapManager.add('joined', entity);

          joinedChannelList.push(entity);
        } else if (type === 'privategroup') {
          //EntityMapManager.add('private', entity);

          privateGroupList.push(entity);
        }

        //EntityMapManager.add('total', entity);
      });

      _createEntityData(totalEntities, function(entity, type) {
        if (type === 'channel' && RoomTopicList.get(entity.id, false)) {
          //EntityMapManager.add('unjoined', entity);

          unJoinedChannelList.push(entity);
        } else if (type === 'user') {
          //EntityMapManager.add('user', entity);
          //EntityMapManager.add('member', entity);
        }

        //EntityMapManager.add('total', entity);
      });

      //_createEntityData(bots, function(bot) {
      //  addBot(bot);
      //});

      return {
        joinedChannelList: joinedChannelList,
        privateGroupList: privateGroupList,
        unJoinedChannelList: unJoinedChannelList
      };
    }

    /**
     * entity data를 생성한다.
     * @param {array} entities
     * @param {function} callback
     * @private
     */
    function _createEntityData(entities, callback) {
      var regxEntityType = /channel|privategroup|user|bot/i;
      var match;
      var type;

      _.each(entities, function(entity) {
        match = regxEntityType.exec(entity.type);
        if (match) {
          type = match[0].toLowerCase();
          _transDatas(entity, type);

          callback(entity, type);
        }
      });
    }

    /**
     * server에서 전달받은 data를 client에서 사용 목적으로 변환한다.
     * @param {object} entity
     * @param {string} type
     * @private
     */
    function _transDatas(entity, type) {
      entity.isStarred = !!entity.isStarred;
      entity.type = type + 's';

      // select dropdown 에서 분류의 목적으로 data를 설정함
      entity.typeCategory = $filter('translate')((type === 'channel' || type === 'privategroup') ? '@common-topics' : '@user');

      if (type === 'user') {
        entity.selected = false;
      }
    }

    /**
     * add bot
     * @param {object} bot
     */
    function addBot(bot) {
      if (_.isObject(bot)) {
        if (bot.botType === 'jandi_bot') {
          _setJandiBot(bot);
        }
        BotList.add(bot);
      }
    }

    /**
     * update bot
     * @param {object} bot
     */
    function updateBot(bot) {
      var targetBot;
      if (_.isObject(bot)) {
        targetBot = getEntityById('total', bot.id);

        targetBot.status = bot.status;
        targetBot.name = bot.name;
        targetBot.thumbnailUrl = bot.thumbnailUrl;
      }
    }
  }
})();
