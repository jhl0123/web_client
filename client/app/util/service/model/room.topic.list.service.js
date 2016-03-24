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
  function RoomTopicList(EntityCollection, UserList) {

    var _collectionMap = {};

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

    this.hasMember = hasMember;
    this.hasUser = hasUser;

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
    }

    /**
     * collection 을 설정한다.
     * @param {Array} list - 설정할
     * @param {boolean} [isJoin=false] - 대상 콜렉션이 사용자가 join 한 방에 대한 콜렉션인지 여부
     */
    function setList(list, isJoin)  {
      var collection = _getEntityCollection(isJoin);
      collection.setList(list);
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
      collection.add(item);
    }

    /**
     * targetObj 를 id 에 해당하는 room 에 extend 한다.
     * @param {number|string} id
     * @param {object} targetObj
     * @returns {boolean}
     */
    function extend(id, targetObj) {
      return _collectionMap.join.extend(id, targetObj) || _collectionMap.unjoin.extend(id, targetObj);
    }

    /**
     * collection 값을 초기화 한다.
     */
    function reset() {
      _collectionMap.join.reset();
      _collectionMap.unjoin.reset();
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
     * @returns {*}
     */
    function remove(id) {
      return _collectionMap.join.remove(id) || _collectionMap.unjoin.remove(id);
    }

    /**
     * 콜렉션을 데이터를 배열 형태로 반환한다.
     * @param {Boolean} isJoin - 대상 콜렉션이 사용자가 join 한 방에 대한 콜렉션인지 여부. 설정하지 않을 시 전체 리스트를 반환한다.
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
        memberIdList = (room.type === 'channels') ? room.ch_members : room.pg_members;
      }
      return memberIdList;
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
  }
})();