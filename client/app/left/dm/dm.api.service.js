/**
 * @fileoverview DM 관련된 API  
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('DmApi', DmApi);

  /* @ngInject */
  function DmApi($http, memberService, configuration, currentSessionHelper, RoomChatDmList, JndUtil) {
    var server_address = configuration.api_address + 'inner-api/';
    
    this.getRecentMessageList = getRecentMessageList;
    this.leaveCurrentMessage = leaveCurrentMessage;
    this.createRoom = createRoom;

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

    /**
     * chat room 을 생성한다.
     * @param {number} memberId
     * @returns {*}
     */
    function createRoom(memberId) {
      var teamId = currentSessionHelper.getCurrentTeam().id;
      return $http({
        method: 'POST',
        url: server_address + 'teams/' + teamId + '/chats',
        data: {
          memberId: memberId
        }
      }).success(_onCreateRoomSuccess)
        .error(JndUtil.alertUnknownError);
    }

    /**
     * room create success 콜백
     * @param  {object} response - 응답 값. 생성된 room 정보.
     * @private
     */
    function _onCreateRoomSuccess(response) {
      RoomChatDmList.add(response);
    }
  }

})();