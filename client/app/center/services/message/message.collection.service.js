/**
 * @fileoverview 메세지 콜렉션
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('MessageCollection', MessageCollection);

  /* @ngInject */
  function MessageCollection($filter, RoomTopicList, CoreUtil, markerService, jndPubSub, memberService,
                             currentSessionHelper, centerService, MessageComment, MessageText, DateFormatter,
                             EntityHandler) {

    var MessageCollectionClass = CoreUtil.defineClass({
      _systemMessageCount: 0,
      _linkId: {
        first: -1,
        last: -1
      },
      _map: {
        messageId: {},
        id: {}
      },
      list: [],
      init: function() {
        this.reset();
      },

      /**
       * 번수를 초기화 한다.
       */
      reset: function() {
        this.list = [];
        this._map = {
          messageId: {},
          id: {}
        };
        this._linkId = {
          first: -1,
          last: -1
        };
        jndPubSub.pub('messages:reset');
      },

      /**
       * for each
       * @param {function} iteratee
       * @param {object} [context]
       */
      forEach: function(iteratee, context) {
        _.forEach(this.list, iteratee, context);
      },

      /**
       * status 가 sending 인 messages 를 제거한다.
       */
      removeAllSendingMessages: function() {
        var list = this.list;
        var length = list.length;
        var i = length - 1;
        var msg;
        var count = 0;
        for (; i >= 0; i--) {
          msg = list[i];
          if (msg.status !== 'sending') {
            break;
          }
          count++;
        }
        list.splice(i + 1, count);
      },

      /**
       * messageList 를 append 한다.
       * @param {array|object} messageList
       */
      append: function(messageList) {
        var list = this.list;
        var length = list.length;
        var lastId = list[length - 1] && list[length - 1].id || -1;
        var appendList = [];
        var markerId;
        messageList = this.beforeAddMessages(messageList);
        _.forEach(messageList, function(msg) {
          if (lastId < msg.id) {
            msg = this.getFormattedMessage(msg);
            list.push(msg);
            appendList.push(msg);

            //작성자의 marker 정보를 업데이트 한다
            markerId = markerService.getLastLinkIdOfMemberId(msg.extWriter.id);
            if (markerId && (markerId < msg.id)) {
              markerService.updateMarker(msg.extWriter.id, msg.id);
            }
          }
        }, this);
        this._setLinkId(appendList);
        this._addIndexMap(appendList);
        jndPubSub.pub('messages:append', appendList);
      },

      /**
       * id 와 messageId 로 index 된 Map 에 데이터를 추가한다.
       * @param {Array} list
       * @private
       */
      _addIndexMap: function(list) {
        var map = this._map;
        map.id = _.extend(map.id, _.indexBy(list, 'id'));
        map.messageId = _.extend(map.messageId, _.indexBy(list, 'messageId'));
      },

      /**
       * id 와 messageId 로 index 된 Map 에서 msg 에 해당하는 데이터를 제거한다.
       * @param {object} msg
       * @private
       */
      _removeIndexMap: function (msg) {
        var map = this._map;
        map.id[msg.id] = null;
        delete map.id[msg.id];
        map.messageId[msg.messageId] = null;
        delete map.messageId[msg.messageId]
      },

      /**
       * messageList 를 prepend 한다.
       * @param {array|object} messageList
       */
      prepend: function(messageList) {
        var list = this.list;
        var firstId = list[0] && list[0].id || -1;
        var prependList = [];
        messageList = this.beforeAddMessages(messageList);
        _.forEachRight(messageList, function(msg) {
          if (firstId === -1 || firstId > msg.id) {
            msg = this.getFormattedMessage(msg);
            list.unshift(msg);
            prependList.unshift(msg);
          }
        }, this);
        this._setLinkId(prependList);
        this._addIndexMap(prependList);
        jndPubSub.pub('messages:prepend', prependList);
      },

      /**
       * 메세지를 삭제한다.
       * @param {number|string} messageId 메세지 id
       * @param {boolean} [isReversal] 역순으로 순회할지 여부
       * @returns {boolean} 삭제에 성공했는지 여부
       */
      remove: function(messageId, isReversal) {
        var targetIdx = this.at(messageId, isReversal);
        
        if (targetIdx !== -1) {
          jndPubSub.pub('messages:beforeRemove', targetIdx);
          this._removeIndexMap(this.getByMessageId(messageId));
          this.list.splice(targetIdx, 1);
          jndPubSub.pub('messages:remove', targetIdx);
        }
        return targetIdx !== -1;
      },
      
      /**
       * messageId 에 해당하는 message 를 반환한다.
       * @param {number|string} messageId messageId 메세지 id
       * @returns {*}
       */
      getByMessageId: function(messageId) {
        return this._map.messageId[messageId];
      },

      /**
       * id 에 해당하는 message 를 반환한다.
       * @param {number|string} id 메세지 id
       * @returns {*}
       */
      get: function(id) {
        return this._map.id[id];
      },

      /**
       * messageId 에 해당하는 message 가 몇번째 index 인지 반환한다.
       * @param {number|string} messageId messageId 메세지 id
       * @param {boolean} isReversal 역순으로 순회할지 여부
       * @returns {number}
       */
      at: function(messageId, isReversal) {
        var targetIdx = -1;
        var list = this.list;
        var iterator = isReversal ? _.forEachRight : _.forEach;

        iterator(list, function(message, index) {
          if (message.messageId.toString() === messageId.toString()) {
            targetIdx = index;
            return false;
          }
        });

        return targetIdx;
      },

      /**
       * 서버로 부터 update 정보를 받아 해당 메세지들을 업데이트 한다.
       * @param {array} messageList - 업데이트 할 메세지 리스트
       * @param {boolean} isSkipAppend - append 를 skip 할 지 여부
       */
      update: function(messageList, isSkipAppend) {
        var lastLinkId = this.getLastLinkId();
        _.forEach(messageList, function(msg) {
          if (lastLinkId < msg.id) {
            if (this._isSystemMessage(msg)) {
              this._updateSystemMessage(msg, isSkipAppend);
            } else {
              this._updateUserMessage(msg, isSkipAppend);
            }
          }
        }, this);
        this._setLinkId(messageList);
      },

      /**
       * child text 인지 여부를 반환한다.
       * @param {number} index
       * @returns {boolean}
       */
      isChildText: function(index) {
        var contentType = this.getContentType(index);
        return !!(centerService.isTextType(contentType) && MessageText.isChild(index, this.list));
      },

      /**
       * child comment 인지 여부를 반환한다.
       * @param {number} index
       * @returns {boolean}
       */
      isChildComment: function(index) {
        var contentType = this.getContentType(index);
        return !!(centerService.isCommentType(contentType) && MessageComment.isChild(index, this.list));
      },

      /**
       * title comment 인지 여부를 반환한다.
       * @param {number} index
       * @returns {boolean}
       */
      isTitleComment: function(index) {
        var contentType = this.getContentType(index);
        return !!(centerService.isCommentType(contentType) && MessageComment.isTitle(index, this.list));
      },

      /**
       * link preview 가 존재하는지 여부를 반환한다.
       * @param {number} index
       * @returns {boolean}
       */
      hasLinkPreview: function(index) {
        return !_.isEmpty(this.list[index].message.linkPreview);
      },

      /**
       * integration message에 대한 preview가 존재하는지 여부를 반환한다.
       * @param {number} index
       * @returns {boolean}
       */
      hasConnectPreview: function(index) {
        return !_.isEmpty(this.list[index].message.content.connectInfo);
      },

      /**
       * 새로운 날짜의 시작인지 여부를 반환한다.
       * @param {number} index
       * @returns {boolean}
       */
      isNewDate: function(index) {
        var messages = this.list;
        var prevMsg;
        var msg = messages[index];

        if (index > 0) {
          prevMsg = messages[index - 1];
          if (msg.date !== prevMsg.date) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      },

      /**
       * 해당 메세지의 content type 을 확인한다.
       * @param index 확인할 대상 메세지 인덱스
       * @returns {string} 메세지의 contentType
       */
      getContentType: function(index) {
        var data = this.list[index];
        return data && data.message && data.message.contentType;
      },

      /**
       * message 를 더하기 전 선 처리한다.
       * @param {array} messageList
       * @returns {*}
       * @private
       */
      beforeAddMessages: function(messageList) {
        messageList = _.isArray(messageList) ? _.sortBy(messageList, 'id') : [messageList];

        _.forEach(messageList, function(msg) {
          this.manipulateMessage(msg);
        }, this);
        return messageList;
      },

      /**
       * mark-up에서 사용하기쉽게 msg object를 가공한다.
       * @private
       */
      manipulateMessage: function(msg) {
        var fromEntityId = msg.fromEntity;
        var writer = EntityHandler.get(fromEntityId);

        if (writer) {
          msg.extFromEntityId = fromEntityId;
          msg.extWriter = writer;
          msg.extWriterName = $filter('getName')(writer);
          msg.exProfileImg = memberService.getProfileImage(writer.id, 'small');
          msg.extTime = $filter('gethmmaFormat')(msg.time);
        }
      },

      /**
       * 첫번째 id 를 반환한다.
       * @returns {number}
       */
      getFirstLinkId: function() {
        return this._linkId.first;
      },

      /**
       * 마지막 id 를 반환한다.
       * @returns {number}
       */
      getLastLinkId: function() {
        return this._linkId.last;
      },

      /**
       * 현재 messages중 system message가 몇 개 있는지 리턴한다.
       * @returns {number}
       */
      getSystemMessageCount: function() {
        return this._systemMessageCount;
      },

      /**
       * user message 를 업데이트 한다.
       * @param {object} msg 업데이트할 메세지
       * @param {boolean} isSkipAppend
       * @private
       */
      _updateUserMessage: function(msg, isSkipAppend) {
        var isArchived = false;
        var messageId = msg.messageId;
        var isAppend = false;
        switch (msg.status) {
          // text writed
          case 'created':
            isAppend = true;
            break;
          case 'edited':
            if (this.remove(messageId)) {
              isAppend = true;
            }
            break;
          // text deleted
          case 'archived':
            if (msg.message.contentType !== 'file') {
              this.remove(messageId);
              isArchived = true;
            }
            break;
          // file shared
          case 'shared':
            isAppend = true;
            break;
          // file unshared
          case 'unshared':
            if (this.remove(messageId)) {
              isAppend = true;
            }
            break;
          default:
            console.error("!!! unfiltered message", msg);
            break;
        }

        if (isAppend && !isSkipAppend) {
          this.append(msg);
        }

        if (!isArchived) {
          // When there is a message to update on current topic.
          jndPubSub.pub('newMessageArrived', msg);
        }
      },
      /**
       * system message 를 업데이트한다.
       * @param {object} msg 업데이트할 메세지
       * @param {boolean} isSkipAppend
       * @private
       */
      _updateSystemMessage: function(msg, isSkipAppend) {
        msg = this._getFormattedSystemMsg(msg);
        if (!isSkipAppend) {
          this.append(msg);
        }
        jndPubSub.pub('newSystemMessageArrived', msg);
      },

      /**
       * 기본 메세지에 랜더링에 필요한 추가 정보를 더하여 반환한다.
       * @param {object} msg
       * @returns {object}
       */
      getFormattedMessage: function(msg) {
        msg.date = this._getDateKey(msg.time);
        if (this._isSystemMessage(msg)) {
          msg = this._getFormattedSystemMsg(msg);
        } else {
          // parse HTML, URL code
          msg.message.content._body = msg.message.content.body;
          this._filterContentBody(msg);
        }
        this._setMessageFlag(msg);
        return msg;
      },

      /**
       * time 을 받아 key 값을 생성한다.
       * @param {number} time
       * @returns {*}
       * @private
       */
      _getDateKey: function(time) {
        return DateFormatter.getFormattedDate(time);
      },

      /**
       * message 의 기본 flag를 설정한다.
       * @param {object} msg
       * @private
       */
      _setMessageFlag: function(msg) {
        var contentType;
        var message = msg.message;
        contentType = message.contentType;
        if (contentType === 'file') {
          message.isFile = true;
        } else if (centerService.isTextType(contentType)) {
          message.isText = true;
        } else if (centerService.isCommentType(contentType)) {
          message.isComment = true;
        }
        //todo: remove this (for test)
        message.isStarred = message.isStarred || false;
        return msg;
      },

      /**
       * formatted 된 system message 를 반환한다.
       * @param {object} msg
       * @returns {*}
       * @private
       */
      _getFormattedSystemMsg: function(msg) {
        var newMsg = msg;
        var action = '';
        var entity;

        newMsg.eventType = '/' + msg.info.eventType;
        newMsg.message = {};
        newMsg.message.contentType = 'systemEvent';
        newMsg.message.content = {};
        newMsg.message.writer = EntityHandler.get(msg.fromEntity);

        switch(msg.info.eventType) {
          case 'announcement_created':
            newMsg.announceWriterName = memberService.getNameById(msg.info.eventInfo.writerId);
            break;
          case 'announcement_deleted':
            action = $filter('translate')('@system-msg-announcement-deleted');
            break;
          case 'invite':
            action = $filter('translate')('@msg-invited');
            newMsg.message.invites = [];
            _.each(msg.info.inviteUsers, function(element, index, list) {
              entity = EntityHandler.get(element);
              if (!_.isUndefined(entity)) {
                newMsg.message.invites.push(entity);
              }
            });
            break;
          case 'join' :
            action = $filter('translate')('@msg-joined');
            break;
          case 'leave' :
            action = $filter('translate')('@msg-left');
            break;
          case 'create' :
            if (msg.info.entityType == 'channel') {
              action = $filter('translate')('@msg-create-ch');
            } else {
              action = $filter('translate')('@msg-create-pg');
            }
            break;
          case 'bookmark':
            action = '여기까지 읽음.';
            break;

        }

        newMsg.message.content.actionOwner = memberService.getNameById(msg.fromEntity);
        newMsg.message.content.body = action;
        this._systemMessageCount++;
        return newMsg;
      },

      /**
       * 시스템 메세지인지 여부를 반환한다.
       * @param {object} msg 메세지
       * @returns {boolean} 시스템 메세지 여부
       * @private
       */
      _isSystemMessage: function(msg) {
        var sysMap = {
          'event': true
        };
        return !!(msg && sysMap[msg.status]);
      },

      /**
       * 메세지를 노출하기 알맞게 가공한다.
       * @param {object} msg 메세지
       * @private
       */
      _filterContentBody: function(msg) {
        var body = msg.message.content.body;

        if (body !== undefined && body !== "") {
          body = $filter('mention')(body, msg.message.mentions);
          body = $filter('parseAnchor')(body);
          body = $filter('mentionHtmlDecode')(body);
          body = $filter('markdown')(body);
        }
        msg.message.content.body = body;
      },

      /**
       * unread count 를 업데이트 한다.
       */
      updateUnreadCount: function() {
        var list = this.list;
        var globalUnreadCount;
        var lastLinkIdToCount = markerService.getLastLinkIdToCountMap();
        var markerOffset = markerService.getMarkerOffset();
        var currentUnread;
        var isChat = centerService.isChat();

        if (isChat) {
          globalUnreadCount = 2;
        } else {
          globalUnreadCount = RoomTopicList.getUserLength(currentSessionHelper.getCurrentEntity().id);
        }

        globalUnreadCount = globalUnreadCount - markerOffset;
        _.forEachRight(list, function(message, index) {
          currentUnread = message.unreadCount;

          if (!!lastLinkIdToCount[message.id]) {
            var currentObj = lastLinkIdToCount[message.id];
            var currentObjCount = currentObj.count;

            globalUnreadCount = globalUnreadCount - currentObjCount;
          }

          if (message.unreadCount === '') {
            // if message.unreadCount is an 'empty string', then globalUnreadCount for current message has reached ZERO!!!
            // There is no need to increment unread count for any type of message.
            // So just leave as it is. as ZERO.
            globalUnreadCount = 0;
          } else if (message.unreadCount < globalUnreadCount) {
            globalUnreadCount = message.unreadCount;
          }

          if (globalUnreadCount < 0) globalUnreadCount = 0;
          if (isChat) {
            globalUnreadCount = Math.min(globalUnreadCount, 1);
          }
          if (globalUnreadCount === 0) {
            message.unreadCount = '';
          } else {
            message.unreadCount = globalUnreadCount;
          }

          if (currentUnread !== message.unreadCount) {
            jndPubSub.pub('messages:updateUnread', {
              msg: message,
              index: index
            });
          }
          //message.unreadCount = globalUnreadCount === 0 ? '' : globalUnreadCount;
          list[index] = message;
        }, this);
      },

      /**
       * 
       * @returns {Array}
       */
      getList: function() {
        return this.list;
      },

      /**
       * 
       * @param list
       */
      setList: function(list) {
        this.list = list;
        this._setLinkId(list);
        this._addIndexMap(list);
        jndPubSub.pub('messages:set', list);
      },

      /**
       * linkId 를 설정한다.
       * @param {Array} list
       * @private
       */
      _setLinkId: function(list) {
        var messageList = this.list;
        var first = messageList.length ? messageList[0].id : -1;
        var last = messageList.length ? messageList[messageList.length - 1].id : -1;
        if (list.length) {
          first = list[0].id < first ? list[0].id : first;
          last = list[list.length - 1].id > last ? list[list.length - 1].id : last;
        }

        this._linkId = {
          first: first,
          last: last
        };
      },

      /**
       * system event 들을 제외하고 맨 마지막 메세지의 link id를 리턴한다.
       * 리턴값이 -1 일때는 file share/unshare 혹은 message created 가 없을때이다.
       * @returns {number}
       */
      getLastActiveLinkId: function() {
        var linkId = -1;
        _.forEachRight(this.list, function(msg) {
          if (msg.status !== 'event') {
            linkId = msg.id;
            return false;
          }
        });
        return linkId;
      }
    });
    
    return new MessageCollectionClass();
  }
})();
