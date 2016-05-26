/**
 * @fileoverview Comment Message 서비스
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MessageComment', MessageComment);

  /* @ngInject */
  function MessageComment(centerService) {
    this.isChild = isChild;
    this.isTitle = isTitle;
    this.isFirst = isFirst;
    this.isLast = isLast;

    /**
     * title comment 인지 여부
     * @param {number} index
     * @param {array} list
     * @returns {boolean}
     */
    function isTitle(index, list) {
      var messages = list;
      var message = messages[index];
      var prevMessage;
      var feedbackId;

      if (index > 0) {
        prevMessage = messages[index - 1];
        feedbackId = message.feedbackId;
        if (prevMessage &&
          (prevMessage.messageId == feedbackId || prevMessage.feedbackId === feedbackId)) {
          return false;
        }
      }
      return true;
    }

    /**
     * child comment 인지 여부
     * @param {number} index
     * @param {array} list
     * @returns {boolean}
     */
    function isChild(index, list) {
      var messages = list;
      var message = messages[index];
      var prevMessage = messages[index - 1];
      var isChild = false;
      var writerId;

      if (message) {
        writerId = message.message.writerId;
        if (!isTitle(index, list) && prevMessage &&
          (prevMessage.message.contentType === 'comment' || prevMessage.message.contentType === 'comment_sticker') &&
          prevMessage.message.writerId === writerId &&
          !centerService.isElapsed(prevMessage.time, message.time)) {
          isChild = true;
        }
      }

      return isChild;
    }

    /**
     * 파일에 달린 comment 중 첫번째 comment 인지 여부
     * @param {number} index
     * @param {array} list
     * @returns {boolean}
     */
    function isFirst(index, list) {
      var isFirst = false;
      var prevMessage;

      if (isTitle(index, list)) {
        isFirst = true;
      } else {
        prevMessage = list[index - 1];
        if (prevMessage && prevMessage.message.contentType === 'file') {
          isFirst = true;
        }
      }

      return isFirst;
    }

    /**
     * 파일에 달린 comment 중 마지막 comment 인지 여부
     * @param {number} index
     * @param {array} list
     * @returns {boolean}
     */
    function isLast(index, list) {
      var isLast = false;
      var nextMessage = list[index + 1];

      if (!nextMessage ||
        nextMessage.message.contentType !== 'comment' ||
        nextMessage.message.contentType === 'comment_sticker') {
        isLast = true;
      }

      return isLast;
    }
  }
})();
