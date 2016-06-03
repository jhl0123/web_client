/**
 * @fileoverview Sending Status Message 콜랙션 서비스
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MessageSendingCollection', MessageSendingCollection);

  /* @ngInject */
  function MessageSendingCollection($rootScope, CoreUtil, Sticker, jndPubSub, MessageCacheCollection) {
    var that = this;
    var _sendingKey = 0;
    var _payloads = {};

    this.list = [];
    this.queue = [];

    this.sent = sent;
    this.clearSentMessages = clearSentMessages;

    this.enqueue = enqueue;
    this.splice = splice;
    this.reset = reset;
    this.isSending = isSending;
    this.remove = remove;
    this.indexOf = indexOf;
    this.refreshAt = refreshAt;

    _init();

    /**
     * 생성자 함수
     * @private
     */
    function _init() {
      reset();
    }

    /**
     * sending queue 를 리셋한다.
     */
    function reset() {
      _sendingKey = 0;
      _payloads = {
        success: [],
        failed: []
      };
      that.queue = [];
      that.list = [];
      jndPubSub.pub('MessageSendingCollection:reset');
    }

    /**
     * index 에 해당하는 item 의 뷰를 갱신 한다.
     * @param index
     */
    function refreshAt(index) {
      jndPubSub.pub('MessageSendingCollection:refresh', CoreUtil.pick(that.list, index, 'id'));
    }

    /**
     * payload list 에서 msg 에 해당하는 payload 를 제거한다.
     * @param {object} msg
     */
    function remove(msg) {
      var index = indexOf(msg.id);
      jndPubSub.pub('MessageSendingCollection:beforeRemove', index);
      _removeFromPayloads(msg);
      _removeFromList(msg);
      jndPubSub.pub('MessageSendingCollection:afterRemove', msg);
    }

    /**
     * msg 로부터 payload 를 반환한다.
     * @param {object} msg
     * @returns {*}
     * @private
     */
    function _getPayloads(msg) {
      var status = msg.status;
      var payloads;
      if (status === 'sending') {
        payloads = that.queue;
      } else if (status === 'failed') {
        payloads = _payloads.failed;
      }
      return payloads;
    }

    /**
     * Payload 리스트로부터 msg에 해당하는 payload 를 제거한다.
     * @param {object} msg
     * @private
     */
    function _removeFromPayloads(msg) {
      var index = -1;
      var contentType = msg.message.contentType;
      var msgPayload = msg._payload;
      var payloads = _getPayloads(msg);

      if (payloads) {
        _.forEach(payloads, function(payload, i) {
          if (payload === msgPayload) {
            index = i;
            return false;
          }
        });
        if (index !== -1) {
          if (contentType === 'sticker') {
            payloads[index].sticker = null;
          } else if (contentType === 'text') {
            payloads[index].content = null;
          }
          if (!payloads[index].sticker && !payloads[index].content) {
            splice(index, 1);
          }
        }
      }
    }

    /**
     * message list 로 부터 해당 message 를 제거한다.
     * @param {object} targetMsg - 제거할 메세지
     * @private
     */
    function _removeFromList(targetMsg) {
      var id = targetMsg.id;
      _.forEach(that.list, function(msg, index) {
        if (id === msg.id) {
          that.list.splice(index, 1);
          return false;
        }
      });
    }

    /**
     * 전송한 메세지에 대해 마킹 처리한다.
     * @param {object} payload - 전송한 payload
     * @param {boolean} isSuccess - 성공 여부
     */
    function sent(payload, isSuccess) {
      isSuccess = _.isBoolean(isSuccess) ? isSuccess : true;
      if (isSuccess) {
        _payloads.success.push(payload);
      } else {
        _payloads.failed.push(payload);
      }
    }

    /**
     * 메세지를 앞쪽으로 붙인다.
     * @param {object} payload
     * @private
     */
    function _prepend(payload) {
      var messageList = _getMessageList(payload);
      var messageCollection = MessageCacheCollection.getCurrent();
      messageList = messageCollection.beforeAddMessages(messageList);
      _.forEachRight(messageList, function(msg) {
        msg = messageCollection.getFormattedMessage(msg);
        that.list.unshift(msg);
        jndPubSub.pub('MessageSendingCollection:prepend', msg);
      });
    }

    /**
     * 메세지를 뒷쪽으로 붙인다.
     * @param {object} payload
     * @private
     */
    function _append(payload) {
      var messageList = _getMessageList(payload);
      var messageCollection = MessageCacheCollection.getCurrent();
      messageList = messageCollection.beforeAddMessages(messageList);
      _.forEach(messageList, function(msg) {
        msg = messageCollection.getFormattedMessage(msg);
        that.list.push(msg);
        jndPubSub.pub('MessageSendingCollection:append', msg);
      });
    }

    /**
     * 보낸 메세지에 대한 처리를 한다.
     */
    function clearSentMessages() {
      var i;
      _.forEach(_payloads.success, function(payload) {
        for(i = 0; i < that.list.length; i++) {
          if (that.list[i]._payload === payload) {
            that.list.splice(i, 1);
            i--;
          }
        }
      });

      _payloads.success = [];

      _.forEach(_payloads.failed, function(payload) {
        _.forEach(that.list, function(msg) {
          if (msg._payload === payload) {
            msg.status = 'failed';
          }
        });
      });
      jndPubSub.pub('MessageSendingCollection:clearSentMessages');
    }

    /**
     * id 에 해당하는 message 의 index 를 반환한다.
     * @param {number} id
     * @returns {number}
     */
    function indexOf(id) {
      return _.findIndex(that.list, {
        id: id
      });
    }

    /**
     * queue 에 메세지를 추가 후 sending 아이템을 추가한다.
     * @param {string} content
     * @param {object} sticker
     * @param {array} mentions
     */
    function enqueue(content, sticker, mentions, isSkipAppend) {
      var payload = _getPayload(content, sticker, mentions);
      that.queue.push(payload);
      if (!isSkipAppend) {
        _append(payload);
      }
    }

    /**
     * payload 를 반환한다.
     * @param {string} content
     * @param {object} sticker
     * @param {Array} mentions
     * @returns {{content: *, sticker: *, mentions: *}}
     * @private
     */
    function _getPayload(content, sticker, mentions) {
      sticker = _.clone(sticker);

      if (sticker) {
        sticker.url = Sticker.getRetinaStickerUrl(sticker.url);
      }

      return {
        content: content,
        sticker: sticker,
        mentions: mentions
      };
    }

    /**
     * payload 로 부터 messageList 를 반환한다.
     * @param {object} payload
     * @returns {Array}
     * @private
     */
    function _getMessageList(payload) {
      var messageList = [];
      if (payload.sticker) {
        messageList.push(_getSticker(payload));
      }
      if (payload.content) {
        messageList.push(_getText(payload));
      }
      return messageList;
    }

    /**
     * queue 에서 splice 한다.
     * @param {number} startIdx
     * @param {number} length
     */
    function splice(startIdx, length) {
      that.queue.splice(startIdx, length);
    }

    /**
     * 현재 전송중 여부를 확인한다.
     * @param msg
     * @returns {boolean}
     */
    function isSending(msg) {
      return msg.status === 'sending';
    }

    /**
     * sending status message 의 기본 골격을 생성한다.
     * @param {object} payload
     * @returns {{_payload: *, status: string, id: string, messageId: string, fromEntity: *, time: number, message: {writerId: *}}}
     * @private
     */
    function _getBaseSendingMsg(payload) {
      _sendingKey++;
      var key = '_sending_' + _sendingKey;
      var obj = {
        _payload: payload,
        status: 'sending',
        id: key,
        messageId: key,
        fromEntity: $rootScope.member.id,
        time: (new Date()).getTime(),
        message: {
          writerId: $rootScope.member.id
        }
      };
      return obj;
    }

    /**
     * status sending 인 sticker 메세지를 반환한다.
     * @param {object} payload
     * @returns {{_payload: *, status: string, id: string, messageId: string, fromEntity: *, time: number, message: {writerId: *}}}
     * @private
     */
    function _getSticker(payload) {
      var obj = _getBaseSendingMsg(payload);
      obj.message.content = {
        url: payload.sticker.url
      };
      obj.message.contentType = 'sticker';

      return obj;
    }

    /**
     * status sending 인 text 메세지 object 를 반환한다.
     * @param {object} payload
     * @returns {{_payload: *, status: string, id: string, messageId: string, fromEntity: *, time: number, message: {writerId: *}}}
     * @private
     */
    function _getText(payload) {
      var obj = _getBaseSendingMsg(payload);
      obj.message.content = {
        body: payload.content
      };
      obj.message.contentType = 'text';
      return obj;
    }
  }
})();
