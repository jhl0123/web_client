/**
 * @fileoverfiew chat 관련 socket event를 처리하는 곳
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketChat', jndWebSocketChat);

  /* @ngInject */
  function jndWebSocketChat(jndWebSocketCommon, jndPubSub, RoomChatDmList) {
    var CHAT_CLOSE = 'chat_close';

    var events = [
      {
        name: 'chat_close',
        version: 1,
        handler: _onChatClose
      },
      {
        name: 'chat_created',
        version: 1,
        handler: _onChatCreated
      }
    ];

    this.getEvents = getEvents;

    /**
     * 이 서비스가 관리할 소켓이벤트들과 그에 해당하는 handler를 리턴한다.
     * @returns {{name: string, handler: _onChatClose}[]}
     */
    function getEvents() {
      return events;
    }

    /**
     * 'chat_close' 일 때
     * @param socketEvent
     * @private
     */
    function _onChatClose(socketEvent) {
      if (jndWebSocketCommon.isCurrentEntity({id: socketEvent.chat.id})) {
        jndPubSub.toDefaultTopic();
      }
      jndPubSub.pub('updateChatList');
    }

    /**
     * chat create 이벤트 핸들러
     * @param {object} socketEvent
     * @private
     */
    function _onChatCreated(socketEvent) {
      RoomChatDmList.add(socketEvent.data.chat);
    }
  }
})();
