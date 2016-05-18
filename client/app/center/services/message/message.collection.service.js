/**
 * @fileoverview 메세지 콜렉션
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MessageCollection', MessageCollection);

  /* @ngInject */
  function MessageCollection($filter, RoomTopicList, markerService, jndPubSub, memberService, currentSessionHelper,
                             centerService, MessageComment, MessageText, DateFormatter, EntityHandler) {
    var that = this;
    var _systemMessageCount = 0;
    var _hasBookmark = false;
    var _lastMessage;
    var _linkId = {
      first: -1,
      last: -1
    };
    var _map = {
      messageId: {},
      id: {}
    };

    this.list = [];
    this.reset = reset;
    this.at = at;
    this.get = get
    this.getByMessageId = getByMessageId;
    this.forEach = forEach;

    this.getLastLinkId = getLastLinkId;
    this.getFirstLinkId = getFirstLinkId;
    this.getSystemMessageCount = getSystemMessageCount;

    this.hasLinkPreview = hasLinkPreview;
    this.hasConnectPreview = hasConnectPreview;

    this.isChildText = isChildText;
    this.hasChildText = hasChildText;
    this.isChildComment = isChildComment;
    this.hasChildComment = hasChildComment;
    this.isFirstComment = isFirstComment;
    this.isLastComment = isLastComment;
    this.isTitleComment = isTitleComment;
    this.isNewDate = isNewDate;

    this.isElapsed = isElapsed;
    this.getContentType = getContentType;


    this.enqueue = enqueue;
    this.append = append;
    this.prepend = prepend;
    this.remove = remove;
    this.update = update;

    this.beforeAddMessages = beforeAddMessages;
    this.getFormattedMessage = getFormattedMessage;

    this.removeAllSendingMessages = removeAllSendingMessages;
    this.updateUnreadCount = updateUnreadCount;

    this.getList = getList;
    this.setList = setList;

    this.manipulateMessage = manipulateMessage;
    this.getLastActiveLinkId = getLastActiveLinkId;

    _init();

    /**
     * 초기화
     * @private
     */
    function _init() {
      reset();
    }

    /**
     * 번수를 초기화 한다.
     */
    function reset() {
      _systemMessageCount = 0;
      that.list = [];
      _hasBookmark = false;
      _lastMessage = {};
      _map = {
        messageId: {},
        id: {}
      };
      _linkId = {
        first: -1,
        last: -1
      };
      jndPubSub.pub('messages:reset');

    }

    /**
     * for each
     * @param {function} iteratee
     * @param {object} [context]
     */
    function forEach(iteratee, context) {
      _.forEach(that.list, iteratee, context);
    }

    /**
     * status 가 sending 인 messages 를 제거한다.
     */
    function removeAllSendingMessages() {
      var list = that.list;
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
    }

    /**
     * queue 에 메세지를 추가한다.
     * @param {string} content
     * @param {object} sticker
     * @param {array} mentions
     */
    function enqueue(content, sticker, mentions) {
      var messageList = MessageSending.enqueue(content, sticker, mentions);
      var list = [];
      messageList = beforeAddMessages(messageList);
      _.forEach(messageList, function(msg) {
        if (MessageSending.isSending(msg)) {
          msg = getFormattedMessage(msg);
          list.push(msg);
        }
      });
      return list;
    }

    /**
     * messageList 를 append 한다.
     * @param {array} messageList
     */
    function append(messageList) {
      var length = that.list.length;
      var lastId = that.list[length - 1] && that.list[length - 1].id || -1;
      var appendList = [];
      var markerId;
      messageList = beforeAddMessages(messageList);
      _.forEach(messageList, function(msg) {
        if (lastId < msg.id) {
          msg = getFormattedMessage(msg);
          that.list.push(msg);
          appendList.push(msg);

          //작성자의 marker 정보를 업데이트 한다
          markerId = markerService.getLastLinkIdOfMemberId(msg.extWriter.id);
          if (markerId && (markerId < msg.id)) {
            markerService.updateMarker(msg.extWriter.id, msg.id);
          }
        }
      });
      _setLinkId(appendList);
      _addIndexMap(appendList);
      jndPubSub.pub('messages:append', appendList);
    }

    function _addIndexMap(list) {
      _map.id = _.extend(_map.id, _.indexBy(list, 'id'));
      _map.messageId = _.extend(_map.messageId, _.indexBy(list, 'messageId'));
    }
    function _removeIndexMap(msg) {
      _map.id[msg.id] = null;
      delete _map.id[msg.id];
      _map.messageId[msg.messageId] = null;
      delete _map.messageId[msg.messageId]
    }
    /**
     * messageList 를 prepend 한다.
     * @param {array} messageList
     */
    function prepend(messageList) {
      var firstId = that.list[0] && that.list[0].id || -1;
      var prependList = [];
      messageList = beforeAddMessages(messageList);
      _.forEachRight(messageList, function(msg) {
        if (firstId === -1 || firstId > msg.id) {
          msg = getFormattedMessage(msg);
          that.list.unshift(msg);
          prependList.unshift(msg);
        }
      });
      _setLinkId(prependList);
      _addIndexMap(prependList);
      jndPubSub.pub('messages:prepend', prependList);
    }

    /**
     * 메세지를 삭제한다.
     * @param {number|string} messageId 메세지 id
     * @param {boolean} isReversal  역순으로 순회할지 여부
     * @returns {boolean} 삭제에 성공했는지 여부
     */
    function remove(messageId, isReversal) {
      var targetIdx = at(messageId, isReversal);
      var msg;
      if (targetIdx !== -1) {
        jndPubSub.pub('messages:beforeRemove', targetIdx);
        _removeIndexMap(getByMessageId(messageId));
        that.list.splice(targetIdx, 1);
        jndPubSub.pub('messages:remove', targetIdx);
      }


      return targetIdx !== -1;
    }

    /**
     * messageId 에 해당하는 message 를 반환한다.
     * @param {number|string} messageId messageId 메세지 id
     * @param {boolean} isReversal 역순으로 순회할지 여부
     * @returns {*}
     */
    function getByMessageId(messageId, isReversal) {
      return _map.messageId[messageId];
    }

    /**
     * id 에 해당하는 message 를 반환한다.
     * @param {number|string} id 메세지 id
     * @param {boolean} isReversal 역순으로 순회할지 여부
     * @returns {*}
     */
    function get(id, isReversal) {
      return _map.id[id];
    }

    /**
     * messageId 에 해당하는 message 가 몇번째 index 인지 반환한다.
     * @param {number|string} messageId messageId 메세지 id
     * @param {boolean} isReversal 역순으로 순회할지 여부
     * @returns {number}
     */
    function at(messageId, isReversal) {
      var targetIdx = -1;
      var list = that.list;
      var iterator = isReversal ? _.forEachRight : _.forEach;

      iterator(list, function(message, index) {
        if (message.messageId.toString() === messageId.toString()) {
          targetIdx = index;
          return false;
        }
      });

      return targetIdx;
    }

    /**
     * 서버로 부터 update 정보를 받아 해당 메세지들을 업데이트 한다.
     * @param {array} messageList 업데이트 할 메세지 리스트
     */
    function update(messageList, isSkipAppend) {
      var lastLinkId = getLastLinkId();
      _.forEach(messageList, function(msg) {
        if (lastLinkId < msg.id) {
          if (_isSystemMessage(msg)) {
            _updateSystemMessage(msg, isSkipAppend);
          } else {
            _updateUserMessage(msg, isSkipAppend);
          }
        }
      });
      _setLinkId(messageList);
    }

    /**
     * child text 인지 여부를 반환한다.
     * @param {number} index
     * @returns {boolean}
     */
    function isChildText(index) {
      var contentType = getContentType(index);
      return !!(centerService.isTextType(contentType) && MessageText.isChild(index, that.list));
    }

    /**
     * child text 가지고 있는지 여부를 반환한다.
     * @param {number} index
     * @returns {boolean}
     */
    function hasChildText(index) {
      var contentType = getContentType(index);
      return !!(centerService.isTextType(contentType) && MessageText.isChild(index + 1, that.list));
    }

    /**
     * child comment 인지 여부를 반환한다.
     * @param {number} index
     * @returns {boolean}
     */
    function isChildComment(index) {
      var contentType = getContentType(index);
      return !!(centerService.isCommentType(contentType) && MessageComment.isChild(index, that.list));
    }

    /**
     * child comment 가지고 있는지 여부를 반환한다.
     * @param {number} index
     * @returns {boolean}
     */
    function hasChildComment(index) {
      var contentType = getContentType(index);
      return !!(centerService.isCommentType(contentType) && MessageComment.isChild(index + 1, that.list));
    }

    /**
     * 파일에 달린 comment 목록에서 첫번째 인지 여부를 반환한다.
     * @param {number} index
     * @returns {boolean}
     */
    function isFirstComment(index) {
      var contentType = getContentType(index);
      return !!(centerService.isCommentType(contentType) && MessageComment.isFirst(index, that.list));
    }

    /**
     * 파일에 달린 comment 목록에서 마지막 인지 여부를 반환한다.
     * @param {number} index
     * @returns {boolean}
     */
    function isLastComment(index) {
      var contentType = getContentType(index);
      return !!(centerService.isCommentType(contentType) && MessageComment.isLast(index, that.list));
    }

    /**
     * title comment 인지 여부를 반환한다.
     * @param {number} index
     * @returns {boolean}
     */
    function isTitleComment(index) {
      var contentType = getContentType(index);
      return !!(centerService.isCommentType(contentType) && MessageComment.isTitle(index, that.list));
    }

    /**
     * link preview 가 존재하는지 여부를 반환한다.
     * @param {number} index
     * @returns {boolean}
     */
    function hasLinkPreview(index) {
      return !_.isEmpty(that.list[index].message.linkPreview);
    }

    /**
     * integration message에 대한 preview가 존재하는지 여부를 반환한다.
     * @param index
     * @returns {boolean}
     */
    function hasConnectPreview(index) {
      return !_.isEmpty(that.list[index].message.content.connectInfo);
    }

    /**
     * 새로운 날짜의 시작인지 여부를 반환한다.
     * @param {number} index
     * @returns {boolean}
     */
    function isNewDate(index) {
      var messages = that.list;
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
    }

    /**
     * 해당 메세지의 content type 을 확인한다.
     * @param index 확인할 대상 메세지 인덱스
     * @returns {string} 메세지의 contentType
     */
    function getContentType(index) {
      var data = that.list[index];
      return data && data.message && data.message.contentType;
    }

    /**
     *
     * @param messageList
     * @returns {*}
     * @private
     */
    function beforeAddMessages(messageList) {
      messageList = _.isArray(messageList) ? _.sortBy(messageList, 'id') : [messageList];

      _.forEach(messageList, function(msg) {
        manipulateMessage(msg);
      });

      //_updateLastMessage(messageList);
      //messageList[messageList.length - 1]._isLast = true;

      return messageList;
    }

    /**
     * mark-up에서 사용하기쉽게 msg object를 가공한다.
     * @private
     */
    function manipulateMessage(msg) {
      var fromEntityId = msg.fromEntity;
      var writer = EntityHandler.get(fromEntityId);

      if (writer) {
        msg.extFromEntityId = fromEntityId;
        msg.extWriter = writer;
        msg.extWriterName = $filter('getName')(writer);
        msg.exProfileImg = memberService.getProfileImage(writer.id, 'small');
        msg.extTime = $filter('gethmmaFormat')(msg.time);
      }
    }

    function _isSending(msg) {
      return msg.status === 'sending';
    }

    //function _updateLastMessage(messageList) {
    //  if (messageList && messageList.length) {
    //    var _tempLastMessage = messageList[messageList.length - 1];
    //    if (!_isSending(_tempLastMessage)) {
    //      _tempLastMessage._isLast = true;
    //
    //      if (!_.isEmpty(_lastMessage)) {
    //        if (_lastMessage.id < _tempLastMessage.id) {
    //          _lastMessage._isLast = false;
    //          _lastMessage = _tempLastMessage;
    //        }
    //      } else {
    //        _lastMessage = _tempLastMessage;
    //      }
    //    }
    //  }
    //}
    /**
     * 첫번째 id 를 반환한다.
     * @returns {number}
     */
    function getFirstLinkId() {
      //var linkId = -1;
      //if (that.list.length) {
      //  linkId = that.list[0].id;
      //}
      //return linkId;
      return _linkId.first;
    }

    /**
     * 마지막 id 를 반환한다.
     * @returns {number}
     */
    function getLastLinkId() {
      //var linkId = -1;
      //if (that.list.length) {
      //  linkId = that.list[that.list.length - 1].id;
      //}
      //return linkId;
      return _linkId.last;
    }

    /**
     * 현재 messages중 system message가 몇 개 있는지 리턴한다.
     * @returns {number}
     */
    function getSystemMessageCount() {
      return _systemMessageCount;
    }
    /**
     * 연속된 메세지로 간주할 시간 허용 범위를 초과하였는지 여부
     * @param {number} startTime 시작 시간
     * @param {number} endTime  끝 시간
     * @returns {boolean} 초과했는지 여부
     * @private
     */
    function isElapsed(startTime, endTime) {
      var elapsedMin = Math.floor((endTime - startTime) / 60000);
      return elapsedMin > MAX_MSG_ELAPSED_MINUTES;
    }

    /**
     * user message 를 업데이트 한다.
     * @param {object} msg 업데이트할 메세지
     * @private
     */
    function _updateUserMessage(msg, isSkipAppend) {
      var isArchived = false;
      var messageId = msg.messageId;
      var isAppend = false;
      switch (msg.status) {
        // text writed
        case 'created':
          isAppend = true;
          break;
        case 'edited':
          if (remove(messageId)) {
            isAppend = true;
          }
          break;
        // text deleted
        case 'archived':
          if (msg.message.contentType !== 'file') {
            remove(messageId);
            isArchived = true;
          }
          break;
        // file shared
        case 'shared':
          isAppend = true;
          break;
        // file unshared
        case 'unshared':
          if (remove(messageId)) {
            isAppend = true;
          }
          break;
        default:
          console.error("!!! unfiltered message", msg);
          break;
      }

      if (isAppend && !isSkipAppend) {
        append(msg);
      }

      if (!isArchived) {
        // When there is a message to update on current topic.
        jndPubSub.pub('newMessageArrived', msg);
      }
    }

    /**
     * system message 를 업데이트한다.
     * @param {object} msg 업데이트할 메세지
     * @returns {*}
     * @private
     */
    function _updateSystemMessage(msg, isSkipAppend) {
      msg = _getFormattedSystemMsg(msg);
      if (!isSkipAppend) {
        append(msg);
      }
      jndPubSub.pub('newSystemMessageArrived', msg);
    }

    /**
     * 기본 메세지에 랜더링에 필요한 추가 정보를 더하여 반환한다.
     * @param {object} msg
     * @returns {object}
     */
    function getFormattedMessage(msg) {
      msg.date = _getDateKey(msg.time);
      if (_isSystemMessage(msg)) {
        msg = _getFormattedSystemMsg(msg);
      } else {
        // parse HTML, URL code
        msg.message.content._body = msg.message.content.body;
        _filterContentBody(msg);
      }
      _setMessageFlag(msg);
      return msg;
    }

    function _getDateKey(time) {
      return DateFormatter.getFormattedDate(time);
    }

    /**
     * message 의 기본 flag를 설정한다.
     * @param {object} msg
     * @private
     */
    function _setMessageFlag(msg) {
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
    }


    /**
     * formatted 된 system message 를 반환한다.
     * @param {object} msg
     * @returns {*}
     * @private
     */
    function _getFormattedSystemMsg(msg) {
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
      _systemMessageCount++;
      return newMsg;
    }

    /**
     * 시스템 메세지인지 여부를 반환한다.
     * @param {object} msg 메세지
     * @returns {boolean} 시스템 메세지 여부
     * @private
     */
    function _isSystemMessage(msg) {
      var sysMap = {
        'event': true
      };
      return !!(msg && sysMap[msg.status]);
    }

    /**
     * 공유/공유해제 메세지인지 여부를 반환한다.
     * @param {object} msg 메세지
     * @returns {boolean}
     * @private
     */
    function _isSharingStatusMassage(msg) {
      if (msg && (msg.status === 'shared' || msg.status === 'unshared') &&
        msg.message &&
        msg.message.shareEntities &&
        msg.message.shareEntities.length) {
        return true;
      } else {
        return false;
      }
    }

    /**
     * 메세지를 노출하기 알맞게 가공한다.
     * @param {object} msg 메세지
     * @private
     */
    function _filterContentBody(msg) {
      var body = msg.message.content.body;

      if (body !== undefined && body !== "") {
        body = $filter('mention')(body, msg.message.mentions);
        body = $filter('parseAnchor')(body);
        body = $filter('mentionHtmlDecode')(body);
        body = $filter('markdown')(body);
      }
      msg.message.content.body = body;
    }

    /**
     * unread count 를 업데이트 한다.
     */
    function updateUnreadCount() {
      var list = that.list;
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
      });
    }

    function getList() {
      return that.list;
    }

    function setList(list) {
      //_updateLastMessage(list);
      that.list = list;
      _setLinkId(list);
      _addIndexMap(list);
      jndPubSub.pub('messages:set', list);
    }

    function _setLinkId(list) {
      var messageList = that.list;
      var first = messageList.length ? messageList[0].id : -1;
      var last = messageList.length ? messageList[messageList.length - 1].id : -1;
      if (list.length) {
        first = list[0].id < first ? list[0].id : first;
        last = list[list.length - 1].id > last ? list[list.length - 1].id : last;
      }

      _linkId = {
        first: first,
        last: last
      };
    }

    /**
     * system event들을 제외하고 맨 마지막 메세지의 link id를 리턴한다.
     * 리턴값이 -1 일때는 file share/unshare 혹은 message created 가 없을때이다.
     * @returns {number}
     */
    function getLastActiveLinkId() {
      var linkId = -1;
      _.forEachRight(that.list, function(msg) {
        if (msg.status !== 'event') {
          linkId = msg.id;
          return false;
        }
      });
      return linkId;
    }

  }
})();
