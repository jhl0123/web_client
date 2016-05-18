/**
 * @fileoverview Topic Room List Model
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('RoomTopicList', RoomTopicList);

  /* @ngInject */
  function RoomTopicList($timeout, $rootScope, EntityCollection, UserList, jndPubSub, memberService) {
    var _timerNotifyChange;
    var _collectionMap = {};
    var _changedIdMap = {};
    var _scope = $rootScope.$new();

    this.setList = setList;
    this.add = add;
    this.remove = remove;
    this.reset = reset;
    this.get = get;
    this.toJSON = toJSON;
    this.extend = extend;
    this.isExist = isExist;

    this.isPrivate = isPrivate;
    this.isPublic = isPublic;
    this.isJoined = isJoined;

    this.join = join;
    this.unjoin = unjoin;
    
    this.hasMember = hasMember;
    this.hasUser = hasUser;
    
    this.addMember = addMember;
    this.removeMember = removeMember; 

    this.getMemberIdList = getMemberIdList;
    this.getUserIdList = getUserIdList;
    this.getUserLength = getUserLength;

    _init();

    /**
     * 초기화 메서드
     * @private
     */
    function _init() {
      _collectionMap.join = new EntityCollection({
        key: 'id'
      });
      _collectionMap.unjoin = new EntityCollection({
        key: 'id'
      });
      _attachScopeEvents();
    }

    /**
     * scope 이벤트를 바인딩한다.
     * @private
     */
    function _attachScopeEvents() {
      _scope.$on('jndWebSocketTeam:memberLeft', _onMemberLeft);
    }

    /**
     * member 가 team 에서 나간 경우, 모든 방에서 해당 member 에 대해 제거하는 처리를 한다.
     * @param angularEvent
     * @param member
     * @private
     */
    function _onMemberLeft(angularEvent, member) {
      var rooms = toJSON();
      var memberId = member.id;
      var index;
      var memberIdList;

      _.forEach(rooms, function(room) {
        memberIdList = (room.type === 'channels') ? room.ch_members : room.pg_members;
        index = memberIdList.indexOf(memberId);
        if (index !== -1) {
          //room.members 는 memberIdList 의 참조이므로 따로 splice 처리하지 않는다.
          memberIdList.splice(index, 1);
          _notifyChange(room.id);
        }
      });
    }

    /**
     * collection 을 설정한다.
     * @param {Array} list - 설정할
     * @param {boolean} [isJoin=false] - 대상 콜렉션이 사용자가 join 한 방에 대한 콜렉션인지 여부
     */
    function setList(list, isJoin)  {
      var collection = _getEntityCollection(isJoin);
      collection.setList(list);
      _notifyChange();
    }

    /**
     * 인자 값에 해당하는 collection 을 반환한다.
     * @param {Boolean} [isJoin=false] - 대상 콜렉션이 사용자가 join 한 방에 대한 콜렉션인지 여부
     * @returns {*}
     * @private
     */
    function _getEntityCollection(isJoin) {
      return isJoin ? _collectionMap.join : _collectionMap.unjoin;
    }

    /**
     * item 을 collection 에 추가한다.
     * @param {object} item
     * @param {Boolean} [isJoin=false] - 대상 콜렉션이 사용자가 join 한 방에 대한 콜렉션인지 여부
     */
    function add(item, isJoin) {
      var collection = _getEntityCollection(isJoin);
      var id = item.id;

      _.extend(item, {
        subscribe: _.isUndefined(item.subscribe) ? true : item.subscribe,
        isStarred: _.isUndefined(item.isStarred) ? false : item.isStarred
      });

      collection.add(item);

      if (isExist(id, !isJoin)) {
        remove(id, !isJoin);
      }
      _manipulateRoomData(id);
      _notifyChange(id);
    }

    /**
     * roomId 에 해당하는 방에 member 를 추가한다.
     * @param {number} roomId
     * @param {number|array} newMemberIds - 방에 추가할 멤버 id. 배열일 경우 복수의 멤버를 추가한다.
     */
    function addMember(roomId, newMemberIds) {
      var memberIds;
      var tempArr;
      if (newMemberIds) {
        memberIds = getMemberIdList(roomId);
        newMemberIds = _.isArray(newMemberIds) ? newMemberIds : [newMemberIds];

        tempArr = memberIds.concat(newMemberIds);

        //참조를 끊지 않기 위해 splice 로 member array 를 비우고, push 하여 채운다
        memberIds.splice(0);
        _.forEach(_.uniq(tempArr), function(member) {
          memberIds.push(member);
        });
        _notifyChange(roomId);
      }
    }

    /**
     * roomId 에 해당하는 방에서 member 를 제거한다.
     * @param {number} roomId
     * @param {number|array} removeMemberIds - 방에서 삭제할 멤버 id. 배열일 경우 복수의 멤버를 삭제한다.
     */
    function removeMember(roomId, removeMemberIds) {
      var memberIds;
      var index;
      if (removeMemberIds) {
        memberIds = getMemberIdList(roomId);
        removeMemberIds = _.isArray(removeMemberIds) ? removeMemberIds : [removeMemberIds];

        _.forEach(removeMemberIds, function(removeMemberId) {
          index = memberIds.indexOf(removeMemberId);
          if (index !== -1) {
            memberIds.splice(index, 1);
          }
        });
        _notifyChange(roomId);
      }
    }
    
    /**
     * targetObj 를 id 에 해당하는 room 에 extend 한다.
     * @param {number|string} id
     * @param {object} targetObj
     * @returns {boolean}
     */
    function extend(id, targetObj) {
      var result = _collectionMap.join.extend(id, targetObj) || _collectionMap.unjoin.extend(id, targetObj);
      _manipulateRoomData(id);
      _notifyChange(id);
      return result;
    }

    /**
     * collection 값을 초기화 한다.
     */
    function reset() {
      _collectionMap.join.reset();
      _collectionMap.unjoin.reset();
      _notifyChange();
    }

    /**
     * 현재 Member 가 roomId 에 해당하는 방에 join 했을 때
     * @param {number} roomId
     */
    function join(roomId) {
      var room = get(roomId);
      var memberId = memberService.getMemberId();

      if (!isExist(roomId, true)) {
        add(room, true);
        addMember(roomId, memberId);
      }

      remove(roomId, false);
    }

    /**
     * 현재 Member 가 roomId 에 해당하는 방에서 나갔을 때
     * @param {number} roomId
     */
    function unjoin(roomId) {
      var room = get(roomId);
      var memberId = memberService.getMemberId();
      
      if (isPublic(roomId) && !isExist(roomId, false)) {
        add(room, false);
        removeMember(roomId, memberId);
      }
      remove(roomId, true);
    }
    
    /**
     * id 에 해당하는 데이터를 반환한다.
     * @param {number|string} id
     * @param {boolean} [isJoin] - 대상 콜렉션이 사용자가 join 한 방에 대한 콜렉션인지 여부. 설정하지 않을 시 전체 리스트를 대상으로 한다.
     * @returns {*}
     */
    function get(id, isJoin) {
      var list;
      if (_.isBoolean(isJoin)) {
        list = _getEntityCollection(isJoin).get(id);
      } else {
        list = _collectionMap.join.get(id) || _collectionMap.unjoin.get(id);
      }
      return list;
    }

    /**
     * id 에 해당하는 데이터를 제거한다.
     * @param {number|string} id
     * @param {boolean} isJoin
     * @returns {*}
     */
    function remove(id, isJoin) {
      var result = false;
      if (_.isUndefined(isJoin)) {
        result = _collectionMap.join.remove(id) || _collectionMap.unjoin.remove(id);
      } else {
        if (isJoin) {
          result = _collectionMap.join.remove(id);
        } else {
          result = _collectionMap.unjoin.remove(id);
        }
      }
      _notifyChange(id);
      return result;
    }

    /**
     * 콜렉션을 데이터를 배열 형태로 반환한다.
     * @param {Boolean} [isJoin] - 대상 콜렉션이 사용자가 join 한 방에 대한 콜렉션인지 여부. 설정하지 않을 시 전체 리스트를 반환한다.
     * @returns {Array}
     */
    function toJSON(isJoin) {
      var list;
      if (_.isBoolean(isJoin)) {
        list = _getEntityCollection(isJoin).toJSON();
      } else {
        list = _collectionMap.join.toJSON(true).concat(_collectionMap.unjoin.toJSON(true));
      }
      return list;
    }

    /**
     * roomId 토픽의 member(bot 포함) id 리스트를 반환한다.
     * @param {number|string} roomId
     * @returns {Array}
     */
    function getMemberIdList(roomId) {
      var memberIdList = [];
      var room = get(roomId);
      if (room) {
        memberIdList = ((room.type === 'channels') ? room.ch_members : room.pg_members) || room.members;
      }
      return memberIdList || [];
    }

    /**
     * roomId 토픽의 user id 리스트를 반환한다.
     * @param {number|string} roomId
     * @returns {Array}
     */
    function getUserIdList(roomId) {
      var memberIdList = getMemberIdList(roomId);
      var userIdList = [];
      _.forEach(memberIdList, function(memberId) {
        if (UserList.isExist(memberId)) {
          userIdList.push(memberId);
        }
      });
      return userIdList;
    }

    /**
     * roomId 토픽에 몇 명의 user 가 있는지 반환한다.
     * @param {number|string} roomId
     * @returns {*}
     */
    function getUserLength(roomId) {
      return getUserIdList(roomId).length;
    }

    /**
     * roomId 에 해당하는 토픽에 memberId 에 해당하는 사용자가 존재하는지 반환한다.
     * member - bot 을 포함한 전체 멤버
     * user - 멤버 중 사람만 해당
     * @param {number|string} roomId
     * @param {number|string} memberId
     * @returns {boolean}
     */
    function hasMember(roomId, memberId) {
      var members = getMemberIdList(roomId);
      return members.indexOf(memberId) !== -1;
    }

    /**
     * roomId 에 해당하는 토픽에 userId 에 해당하는 사용자가 존재하는지 반환한다.
     * @param {number|string} roomId
     * @param {number|string} userId
     * @returns {boolean}
     */
    function hasUser(roomId, userId) {
      var users = getUserIdList(roomId);
      return users.indexOf(userId) !== -1;
    }

    /**
     * id 에 해당하는 item 이 존재하는지 여부를 반환한다.
     * @param {number|string} roomId
     * @param {boolean} [isJoined=false]
     */
    function isExist(roomId, isJoined) {
      return !!get(roomId, isJoined);
    }

    /**
     * id 에 해당하는 room 이 비공개인지 여부를 반환한다.
     * @param {number|string} id
     * @returns {boolean}
     */
    function isPrivate(id) {
      var topic = get(id);
      //@fixme: indexOf 대신 일치 연산자로 문자열 비교 필요
      return !!(topic && topic.type.indexOf('private') !== -1);
    }

    /**
     * id 에 해당하는 room 이 공개인지 여부를 반환한다.
     * @param {number|string} id
     * @returns {boolean}
     */
    function isPublic(id) {
      var topic = get(id);
      //@fixme: indexOf 대신 일치 연산자로 문자열 비교 필요
      return !!(topic && topic.type.indexOf('channel') !== -1);
    }

    /**
     * 가입한 topic 인지 여부를 반환한다.
     * @param {number|string} roomId
     * @returns {boolean}
     */
    function isJoined(roomId) {
      return !!get(roomId, true)
    }

    /**
     * 화면에 render 한다.
     * @param {number|string} [roomId]
     * @private
     */
    function _notifyChange(roomId) {
      if (roomId) {
        _changedIdMap[roomId] = true;
      }
      
      $timeout.cancel(_timerNotifyChange);
      //성능 향상 목적으로 랜더링 수행을 최소화 하기 위해 timeout 을 이용한다.
      _timerNotifyChange = $timeout(function() {
        jndPubSub.pub('RoomTopicList:changed', _changedIdMap);
        _changedIdMap = {};
      }, 500);
    }

    /**
     * roomData 에 필요한 정보를 추가한다
     * @param {number|string} id
     * @private
     */
    function _manipulateRoomData(id) {
      var room = get(id);
      if (room) {
        if (_isLegacyRoomFormat(room)) {
          room.members = getMemberIdList(room.id);
        } else {
          _convertToLegacyRoomFormat(room);
        }
      }
    }

    /**
     * 현재 legacy 호환성 유지를 위해 최신 포멧을 legacy room format 으로 확장한다.
     * TODO: pg_ 혹은 ch_ 형태의 데이터 모델을 최신 데이터 모델로 모두 변경 필요
     * @param {object} room - 최신 room 데이터 모델
     *    @param {number} room.id
     *    @param {number} room.teamId
     *    @param {string} room.type
     *    @param {string} room.name
     *    @param {string} room.description
     *    @param {boolean} room.autoJoin
     *    @param {array} room.members
     *    @param {number} room.deleterId
     *    @param {number} room.creatorId
     *    @param {string} room.status
     *    @param {number} room.lastLinkId
     * @private
     */
    function _convertToLegacyRoomFormat(room) {
      if (room) {
        //공개 토픽
        if (room.type.indexOf('channel') !== -1) {
          _.extend(room, {
            ch_members: room.members,
            ch_creatorId: room.creatorId,
            ch_createTime: 0
          });
        //비공개 토픽
        } else {
          _.extend(room, {
            pg_members: room.members,
            pg_creatorId: room.creatorId,
            pg_createTime: 0
          });
        }
      }
    }

    /**
     * room 이 legacy 포멧 형태인지 여부를 반환한다
     * @param {object} room
     * @returns {boolean}
     * @private
     */
    function _isLegacyRoomFormat(room) {
      return !!(room.ch_members || room.pg_members);
    }
  }
})();
