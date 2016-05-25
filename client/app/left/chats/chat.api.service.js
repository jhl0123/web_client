(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('ChatApi', ChatApi);

  /* @ngInject */
  function ChatApi($http, memberService, configuration) {
    var server_address = configuration.api_address + 'inner-api/';
    this.getRecentMessageList = getRecentMessageList;
    this.leaveCurrentMessage = leaveCurrentMessage;


    function getRecentMessageList() {
      return $http({
        method: 'GET',
        url: server_address + 'members/' + memberService.getMemberId() + '/chats',
        params: {
          memberId: memberService.getMemberId()
        }
      });
    }

    function leaveCurrentMessage(messageId) {
      return $http({
        method: 'DELETE',
        url: server_address + 'members/' + memberService.getMemberId() + '/chats/' + messageId
      });
    }

  }

})();