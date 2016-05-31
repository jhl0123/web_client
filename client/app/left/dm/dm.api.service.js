/**
 * @fileoverview DM 관련된 API  
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('DmApi', DmApi);

  /* @ngInject */
  function DmApi($http, memberService, configuration) {
    var server_address = configuration.api_address + 'inner-api/';
    this.getRecentMessageList = getRecentMessageList;
    this.leaveCurrentMessage = leaveCurrentMessage;


    /**
     * 최근 채팅 리스트를 조회한다.
     * @returns {*}
     */
    function getRecentMessageList() {
      return $http({
        method: 'GET',
        url: server_address + 'members/' + memberService.getMemberId() + '/chats',
        params: {
          memberId: memberService.getMemberId()
        }
      });
    }

    /**
     * roomId 에 해당하는 토픽에서 나간다.
     * @param {number} roomId
     * @returns {*}
     */
    function leaveCurrentMessage(roomId) {
      return $http({
        method: 'DELETE',
        url: server_address + 'members/' + memberService.getMemberId() + '/chats/' + roomId
      });
    }
    
    function create(memberId) {
      return $http({
        method: 'POST',
        url: server_address + 'teams/' + memberService.getTeamId() + '/chats/' + roomId
      });
    }

  }

})();