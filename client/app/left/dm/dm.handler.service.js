/**
 * @filevoerview DM Chat 관리 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('DmHandler', DmHandler);

  /* @ngInject */
  function DmHandler(DmApi, EntityHandler, MessageCacheCollection) {
    var _that = this;

    this.list = [];
    this.getRecentList = getRecentList;
    this.parse = parse;

    /**
     * 최근 Chat 목록을 조회한다.
     * @returns {*}
     */
    function getRecentList() {
      return DmApi.getRecentMessageList()
        .then(_onSuccessGetRecent);
    }

    /**
     * 최근 목록 조회 성공 핸들러
     * @param {object} result
     * @private
     */
    function _onSuccessGetRecent(result) {
      parse(result.data);
    }

    /**
     * DM 채팅 정보를 파싱한다.
     * @param {Array} chats
     */
    function parse(chats) {
      chats = _.uniq(chats, 'entityId');
      EntityHandler.parseChatRoomLists(chats);
      MessageCacheCollection.initializeChats();
      _that.list = chats;
    } 
  }
})();
