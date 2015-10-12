/**
 * A service that helps center controller.
 *
 * No http request is made from this service.
 *
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('centerService', centerService);

  /* @ngInject */
  function centerService(memberService, publicService, currentSessionHelper) {
    var MAX_MSG_ELAPSED_MINUTES = 5;    //텍스트 메세지를 하나로 묶을 때 기준이 되는 시간 값
    var SCROLL_BOTTOM_THRESHOLD = 700;    // threshold value to show 'scroll to bottom' icon on center panel.
    var hasBrowserFocus = true;           // indicator whether current browser has focus or not.

    var currentEntityId;

    var HISTORY_LENGTH = 3;
    var historyQueue = [];


    this.preventChatWithMyself  = preventChatWithMyself;
    this.isIE9  = isIE9;
    this.isChat  = isChat;

    this.hasBottomReached = hasBottomReached;
    this.isScrollBottom = isScrollBottom;
    this.isBrowserHidden = isBrowserHidden;

    this.setBrowserFocus = setBrowserFocus;
    this.resetBrowserFocus = resetBrowserFocus;

    this.isMessageFromMe = isMessageFromMe;

    this.setEntityId = setEntityId;
    this.getEntityId = getEntityId;

    this.isTextType = isTextType;
    this.isCommentType = isCommentType;
    this.isElapsed = isElapsed;

    this.getLastReadMessageMarker = getLastReadMessageMarker;

    this.getHistory = getHistory;
    this.setHistory = setHistory

    /**
     * Check entityId of entity to be directed to currently signed in member's id.
     * If user is trying to reach himself, re-direct user back to default topic.
     *
     * @param entityId
     */
    function preventChatWithMyself(entityId) {
      entityId = parseInt(entityId);
      if (entityId === memberService.getMemberId()) {
        publicService.goToDefaultTopic();
      }
    }

    /**
     * Check if current browser is internet explorer 0.
     *
     * @returns {boolean}
     */
    function isIE9() {
      if (angular.isDefined(FileAPI.support)) {
        if (!FileAPI.support.html5)
          return true;
      }
      return false;
    }

    /**
     * Is Current entity chat(DM)?
     *
     * @returns {boolean}
     */
    function isChat() { return currentSessionHelper.getCurrentEntityType() === 'users'; }

    /**
     * Has scroll reached bottom?? or Do I have more room to go down???
     *
     * @returns {boolean}
     */
    function hasBottomReached() {
      var element = document.getElementById('msgs-container');
      var scrollHeight = element.scrollHeight;
      element = angular.element(element);

      return scrollHeight - (element.outerHeight() + element.scrollTop()) < SCROLL_BOTTOM_THRESHOLD;
    }

    /**
     * is scroll bottom
     * @returns {boolean}
     */
    function isScrollBottom() {
      var jqContainer = $('#msgs-container');
      return jqContainer.height() + jqContainer.scrollTop() >= jqContainer[0].scrollHeight;
    }

    /**
     * Set browser indicator to 'true'
     */
    function setBrowserFocus() {
      currentSessionHelper.setBrowserFocus();
    }

    /**
     *  Reset browser indicator back to 'false'
     */
    function resetBrowserFocus() {
      currentSessionHelper.resetBrowserFocus();
    }

    /**
     * Check if current browser has focus or not.
     *
     * @returns {boolean|*}
     */
    function isBrowserHidden() {
      return currentSessionHelper.isBrowserHidden();
    }

    /**
     * Check whether msg is from myself.
     * True msg is written by me.
     *
     * @param msg
     * @returns {boolean}
     * @private
     */
    function isMessageFromMe(message) {
      var cMemberId = memberService.getMemberId();

      return message.fromEntity === cMemberId || message.writerId === cMemberId;
    }

    /**
     * For New 1:1 chat entity, there is no entityId info stored locally.
     * However, new entityId is given as 'entityId' attribute in response of 'loadmore' function.
     *
     * Save currentEntityId everytime 'loadmore' gets called.
     *
     * @param entityId {number} entityId of current entity
     *
     */
    function setEntityId(entityId) {
      currentEntityId = entityId;
    }
    function getEntityId() {
      return currentEntityId;
    }

    /**
     * content type 이 text type 인지 확인한다.
     * @param {string} contentType
     * @returns {boolean}
     * @private
     */
    function isTextType(contentType) {
      return contentType === 'text' || contentType === 'sticker';
    }

    /**
     * content type 이 코멘트인지 확인한다.
     * @param {string} contentType
     * @returns {boolean}
     * @private
     */
    function isCommentType(contentType) {
      return contentType === 'comment' || contentType === 'comment_sticker';
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
     * entityId에 해당하는 토픽에서 현재 사용자가 마지막으로 읽은 link id를 리턴한다.
     * @param {number} entityId - 알고싶은 토픽의 entity id
     * @returns {number} lastLinkId - 사용자가 마지막으로 읽은 메세지의 link id
     */
    function getLastReadMessageMarker(entityId) {
      return memberService.getLastReadMessageMarker(entityId);
    }

    /**
     * center에 출력된 토픽의 entity type과 entity id를 기록한다.
     * @param {string} entityType
     * @param {number} entityId
     */
    function setHistory(entityType, entityId) {
      if (entityType === 'channels' || entityType === 'privategroups') {
        historyQueue.length >= HISTORY_LENGTH && historyQueue.shift();
        historyQueue.push({
          entityType: entityType,
          entityId: entityId
        });
      }
    }

    /**
     * center에 출력된 토픽의 entity type과 entity id의 기록을 전달한다.
     * @returns {Array}
     */
    function getHistory() {
      return historyQueue;
    }
  }
})();
