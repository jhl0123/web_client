(function(){
  'use strict';

  angular
    .module('jandiApp')
    .factory('entityAPIservice', entityAPIservice);

  /* @ngInject */
  function entityAPIservice(CoreUtil, $state, $window, storageAPIservice, jndPubSub, currentSessionHelper,
                            HybridAppHelper, NotificationManager, EntityHandler, RoomChatDmList) {
    var service = {
      setCurrentEntityWithId: setCurrentEntityWithId,
      setCurrentEntity: setCurrentEntity,
      getCreatorId: getCreatorId,

      updateBadgeValue: updateBadgeValue,
      setLastEntityState: setLastEntityState,
      getLastEntityState: getLastEntityState,
      removeLastEntityState: removeLastEntityState,
      isDefaultTopic: isDefaultTopic,
      isOwner: isOwner,
      getOwnerId: getOwnerId,
      increaseBadgeCount: increaseBadgeCount,
      decreaseBadgeCount: decreaseBadgeCount
    };

    return service;

    function setCurrentEntityWithId(entityId) {
      var currentEntity;
      if (!_.isUndefined(entityId)) {
        currentEntity = EntityHandler.get(entityId);
        //DM 일 경우 currentEntity 는 Member 여야 한다.
        //TODO: setCurrentEntityWithTypeAndId, setCurrentEntity 제거 후 currentSessionHelper 로 통일해야 함
        currentEntity = CoreUtil.pick(currentEntity, 'extMember') || currentEntity;
      }
      if (!_.isUndefined(currentEntity)) {
        setCurrentEntity(currentEntity);
      }
    }

    //  return null if 'getEntityById' return nothing.
    function setCurrentEntity (currentEntity) {
      currentEntity = EntityHandler.get(currentEntity.id);
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
      if (entity) {
        _setBadgeValue(entity, alarmCount);
        NotificationManager.set(entity, alarmCount);
        jndPubSub.pub('badgeCountChange', {
          entity: entity,
          count: alarmCount
        });
      }
    }

    /**
     * badgeValue 를 업데이트 한다.
     * @private
     * @param entity
     * @param alarmCount
     * TODO: EXPLAIN THE SITUATION WHEN 'alarmCount' is 0.
     */
    function _setBadgeValue(entity, alarmCount) {
      var curEntity;

      if (RoomChatDmList.isExist(entity.id)) {
        curEntity = RoomChatDmList.getMember(entity.id)
      } else {
        curEntity = EntityHandler.get(entity.id)
      }

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
  }
})();
