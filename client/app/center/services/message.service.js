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
     * 
     * @param {number} roomId - 토픽일 경우 토픽 id, DM 일 경우 DM 방의 id
     * @param {object} data - request 파라미터. stickerId, groupId, text 중 하나는 필수값이다.
     *    @param {number|string} [data.stickerId]
     *    @param {number|string} [data.groupId]
     *    @param {string} [data.text]
     *    @param {Array} [data.mentions]
     * @param {object} canceller
     * @returns {*}
     */
    function postMessage(roomId, data, canceller) {
      var teamId = memberService.getTeamId();
      return $http({
        method  : 'POST',
        url     : server_address + 'teams/' + teamId + '/rooms/' +  roomId + '/messages',
        data    : data,
        timeout : canceller && canceller.promise
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
     * @param {number} roomId
     * @param {object} canceller
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
