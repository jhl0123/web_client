(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('messageAPIservice', messageAPIservice);

  /* @ngInject */
  function messageAPIservice($http, memberService, configuration, currentSessionHelper) {
    this.getMessage = getMessage;
    this.getMessages = getMessages;
    this.getUpdatedMessages = getUpdatedMessages;
    this.postMessage = postMessage;
    this.deleteMessage = deleteMessage;
    this.deleteSticker = deleteSticker;
    this.searchMessages = searchMessages;
    this.updateMessageMarker = updateMessageMarker;

    this.getRoomInformation = getRoomInformation;

    this.getUpdatedList = getUpdatedList;

    var server_address = configuration.server_address;

    /**
     * get message item
     * @param {string} teamId
     * @param {string} messageId
     */
    function getMessage(teamId, messageId) {
      return $http({
        method  : 'GET',
        url     : server_address + 'teams/' + teamId + '/messages/' + messageId
      });
    }

    function searchMessages(messageSearchQuery) {
      return $http({
        method: 'GET',
        url: server_address + 'teams/' + memberService.getTeamId() + '/search/messages',
        params: messageSearchQuery
      });
    }

    // get message lists
    function getMessages(entityType, entityId, params, canceller) {
      entityType = _getParamEntityType(entityType);
      params = _.extend({
        teamId: memberService.getTeamId()
      }, params);

      return $http({
        method  : 'GET',
        url     : server_address + entityType + '/' + entityId + '/messages',
        params  : params,
        timeout : canceller.promise
      });
    }

    // get updated message lists
    function getUpdatedMessages(entityType, entityId, lastUpdatedId, canceller) {
      entityType = _getParamEntityType(entityType);
      return $http({
        method  : 'GET',
        url     : server_address + entityType + '/' + entityId + '/messages/update/' + lastUpdatedId,
        params  : {
          teamId  : memberService.getTeamId()
        },
        version: 3,
        timeout : canceller.promise
      });
    }

    /**
     * 메세지를 전송한다.
     * @param {string} entityType - entity 타입
     * @param {string} entityId   - entity ID
     * @param {string} message    - 메세지
     * @param {object} sticker    - 스티커 객체
     * @param {array} mentions    - mentions
     * @returns {*}
     */
    function postMessage(entityType, entityId, message, sticker, mentions, canceller) {
      if (sticker && sticker.id && sticker.groupId) {
        return _postSticker(entityType, entityId, message, sticker, mentions, canceller);
      } else {
        return _postMessage(entityType, entityId, message, mentions, canceller);
      }
    }

    /**
     * 메세지를 입력한다.
     * @param {string} entityType - entity 타입
     * @param {string} entityId   - entity ID
     * @param {string} message    - 메세지
     * @param {array} mentions    - mentions
     * @returns {*}
     * @private
     */
    function _postMessage(entityType, entityId, message, mentions, canceller) {
      entityType = _getParamEntityType(entityType);
      return $http({
        method  : 'POST',
        url     : server_address + entityType + '/' + entityId + '/message',
        data    : {
          content: message,
          mentions: mentions
        },
        params  : {
          teamId  : memberService.getTeamId()
        },
        timeout : canceller && canceller.promise,
        version: 3
      });
    }

    /**
     * 스티커를 입력한다.
     * @param {string} entityType - entity 타입
     * @param {string} entityId   - entity ID
     * @param {string} message    - 메세지
     * @param {object} sticker    - 스티커 객체
     * @param {array} mentions    - mentions
     * @returns {*}
     * @private
     */
    function _postSticker(entityType, entityId, message, sticker, mentions, canceller) {
      var data = {
        stickerId: sticker.id,
        groupId: sticker.groupId,
        teamId: memberService.getTeamId(),
        share: entityId,
        type: message ? _getParamEntityType(entityType): '',
        content: message,
        mentions: mentions
      };

      return $http({
        method  : 'POST',
        url     : server_address + 'stickers',
        data    : data,
        timeout : canceller.promise
      });
    }
    /**
     * server 로 전달할 entityType 문자열을 반환한다.
     * @param {string} entityType 전달받은 entityType
     * @param {boolean} [isSingular=false] 단수형인지 복수형인지 여부
     * @returns {string}
     * @private
     */
    function _getParamEntityType(entityType, isSingular) {
      var type = 'channel';

      if (entityType.indexOf('user') > -1) {
        type = 'user';
      } else if (entityType.indexOf('private') > -1) {
        type = 'privateGroup';
      } else if (entityType.indexOf('channel') > -1) {
        type = 'channel';
      }

      if (!isSingular) {
        type += 's';
      }
      return type;
    }

    /**
     * 메세지를 제거한다.
     * @param {string} entityType - entity 타입
     * @param {string} entityId   - entity ID
     * @param {string} messageId  - 메세지 ID
     * @returns {*}
     */
    function deleteMessage(entityType, entityId, messageId) {
      entityType = _getParamEntityType(entityType);
      return $http({
        method  : 'DELETE',
        url     : server_address + entityType + '/' + entityId + '/messages/' + messageId,
        params  : {
          teamId  : memberService.getTeamId()
        }
      });
    }

    /**
     * 스티커를 제거한다.
     * @param {string} messageId 메세지 ID
     * @returns {*}
     */
    function deleteSticker(messageId) {
      return $http({
        method  : 'DELETE',
        url     : server_address + 'stickers/messages/' + messageId,
        params  : {
          teamId  : memberService.getTeamId()
        }
      });
    }

    //  Updates message marker to 'lastLinkId' for 'entitiyId'
    function updateMessageMarker(entityId, entityType, lastLinkId) {
      entityType = _getParamEntityType(entityType, true);

      var data = {
        teamId: memberService.getTeamId(),
        entityType: entityType,
        lastLinkId: lastLinkId
      };

      return $http({
        method  : 'POST',
        url     : server_address + 'entities/' + entityId + '/marker',
        data    : data,
        params  : {
          entityId    : entityId
        }
      });
    }

    /**
     * 방의 정보(mostly marker)를 얻는다.
     * @param roomId
     * @returns {*}
     */
    function getRoomInformation(roomId, canceller) {
      var teamId = currentSessionHelper.getCurrentTeam().id;
      return $http({
        method: 'GET',
        url: server_address + 'teams/' + teamId + '/rooms/' + roomId,
        timeout : canceller.promise
      });
    }

    /**
     * update 된 메세지 리스트를 받아온다.
     * @param {Number|String} roomId
     * @param {Number|String} linkId
     * @param {Object} canceller
     * @returns {*}
     */
    function getUpdatedList(roomId, linkId, canceller) {
      var teamId = currentSessionHelper.getCurrentTeam().id;

      return $http({
        method: 'GET',
        url: server_address + 'teams/' + teamId + '/rooms/' + roomId + '/messages/updatedList',
        params : {
          linkId: linkId
        },
        timeout : canceller.promise
      });
    }
  }
})();
