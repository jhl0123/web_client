/**
 * @fileoverview Member 필터
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('EntityFilterMember', EntityFilterMember);

  /* @ngInject */
  function EntityFilterMember(UserList, BotList) {

    this.toJSON = toJSON;
    this.get = get;
    this.isExist = isExist;
    this.getChatRoomId = getChatRoomId;
    
    _init();

    /**
    * 초기화 메서드
    * @private
    */
    function _init() {
    }

    /**
     * member list 를 반환한다.
     * @returns {Array}
     */
    function toJSON() {
      return UserList.toJSON().concat(BotList.toJSON());
    }

    /**
     * member 정보를 조회한다.
     * @param {number|string} memberId
     * @returns {object}
     */
    function get(memberId) {
      return UserList.get(memberId) || BotList.get(memberId)
    }

    /**
     * 해당 member 가 존재하는지 반환한다.
     * @param {number|string} memberId
     * @returns {boolean}
     */
    function isExist(memberId) {
      return !!get(memberId);
    }

    /**
     * memberId 에 해당하는 chatRoom 의 id 를 반환한다.
     * @param {number|string} memberId
     * @returns {*}
     */
    function getChatRoomId(memberId) {
      return UserList.getChatRoomId(memberId) || BotList.getChatRoomId(memberId)
    }
  }
})();
