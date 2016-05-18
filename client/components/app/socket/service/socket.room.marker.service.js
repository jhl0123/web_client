/**
 * @fileoverview room marker 관련 socket event 처리
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketRoomMarker', jndWebSocketRoomMarker);

  /* @ngInject */
  function jndWebSocketRoomMarker(jndPubSub, jndWebSocketCommon, logger, markerService, EntityHandler) {
    var ROOM_MARKER_UPDATED = 'room_marker_updated';

    var events = [
      {
        name: ROOM_MARKER_UPDATED,
        version: 1,
        handler: _onRoomMarkerUpdated
      }
    ];

    this.getEvents = getEvents;
    function getEvents() {
      return events;
    }

    /**
     * room marker 업데이트 이벤트 콜백
     * @param {object} socketEvent
     * @private
     */
    function _onRoomMarkerUpdated(socketEvent) {
      var room = EntityHandler.get(socketEvent.room.id);
      var marker = socketEvent.marker;
      var memberId = marker.memberId;
      var lastLinkId = marker.lastLinkId;

      
      markerService.updateMarker(memberId, lastLinkId);

      if (jndWebSocketCommon.isActionFromMe(memberId)) {
        jndWebSocketCommon.updateMyLastMessageMarker(room.id, lastLinkId);
      }
      
      if (jndWebSocketCommon.isCurrentEntity(socketEvent.room)) {
        logger.log('update marker for current entity');
        jndPubSub.pub('centerOnMarkerUpdated', socketEvent);
      }
    }
  }
})();
