/**
 * @fileoverview Renderer 에서 필요한 유틸리티 함수
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('RendererUtil', RendererUtil);

  /* @ngInject */
  function RendererUtil($filter, publicService, currentSessionHelper, memberService, FileDetail, centerService) {
    var _regxPreviewThumbnail = /linkpreview-thumb/;
    var _thumbnailTracker = [];


    this.hasMore = hasMore;
    this.hasStar = hasStar;
    this.isSticker = isSticker;
    this.isDisabledMember = isDisabledMember;
    this.isMyMessage = isMyMessage;
    this.getStarCssClass = getStarCssClass;
    this.getDisabledMemberCssClass = getDisabledMemberCssClass;

    this.hasThumbnailCreated = hasThumbnailCreated;
    this.addToThumbnailTracker = addToThumbnailTracker;
    this.cancelThumbnailTracker = cancelThumbnailTracker;

    this.getFileDownloadAttrs = getFileDownloadAttrs;
    this.isIntegrateFile = isIntegrateFile;
    this.getFeedbackMessage = getFeedbackMessage;
    this.getFeedbackContent = getFeedbackContent;
    this.getCommentCount = getCommentCount;

    this.convertToPreview = convertToPreview;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
    }

    /**
     * star 에 필요한 css 클래스 문자열을 반환한다.
     * @param {object} message
     * @returns {string}
     */
    function getStarCssClass(message) {
      return message.isStarred ? 'on' : 'off';
    }

    /**
     * sticker 인지 여부를 반환한다.
     * @param {object} msg
     * @returns {boolean}
     */
    function isSticker(msg) {
      return msg.message.contentType.indexOf('sticker') !== -1;
    }

    /**
     * more (...) 버튼의 존재 여부를 반환한다.
     * @param {object} msg
     * @returns {boolean|*}
    */
    function hasMore(msg) {
      return !isSticker(msg) || isMyMessage(msg) || memberService.isAdmin();
    }

    /**
     * star 를 사용할 수 있는 메세지인지 여부를 반환한다.
     * @param {object} msg
     * @returns {boolean}
     */
    function hasStar(msg) {
      return !isSticker(msg);
    }

    /**
     * 현재 사용자의 메세지인지 여부를 반환한다.
     * @param {object} msg
     * @returns {boolean}
     */
    function isMyMessage(msg) {
      return (memberService.getMemberId() === msg.fromEntity);
    }

    /**
     * disable 사용자인지 여부를 반환한다.
     * @param {object} msg
     * @returns {*|*|boolean|*|boolean|*}
     */
    function isDisabledMember(msg) {
      var currentEntity = (msg && msg.fromEntity) || currentSessionHelper.getCurrentEntity();
      return publicService.isDisabledMember(currentEntity);
    }

    function getDisabledMemberCssClass(msg) {
      return isDisabledMember(msg) ? ' center-panel-disabled-member' : '';
    }

    /**
     * linkPreview 에 thumbnail이 생성되었는지 안되었는지 확인한다.
     * @param {object} linkPreview - link preview object to check
     * @returns {boolean}
     * @private
     */
    function hasThumbnailCreated(linkPreview) {
      return _regxPreviewThumbnail.test(linkPreview.imageUrl);
    }

    function addToThumbnailTracker(messageId, timeout) {
      _thumbnailTracker[messageId] = timeout;
    }

    function cancelThumbnailTracker(messageId) {
      if (_thumbnailTracker[messageId]) {
        clearTimeout(_thumbnailTracker[messageId]);
      }

      delete _thumbnailTracker[messageId];
    }

    /**
     * file download 에 랜더링 할 attribute 문자열을 반환한다.
     * @param {object} msg
     * @returns {string}
     */
    function getFileDownloadAttrs(msg) {
      var content = getFeedbackContent(msg);
      var fileUrl = content.fileUrl;
      var attrList = [];
      var urlObj = $filter('downloadFile')(FileDetail.isIntegrateFile(content.serverUrl), content.title, fileUrl);

      attrList.push('download="' + content.title + '"');
      attrList.push('href="' + urlObj.downloadUrl + '"');

      return attrList.join(' ');
    }

    /**
     * integrate file 인지 여부를 반환한다.
     * @param {object} msg
     * @returns {*}
     * @private
     */
    function isIntegrateFile(msg) {
      var content = getFeedbackContent(msg);
      return FileDetail.isIntegrateFile(content.serverUrl);
    }

    /**
     * msg 에서 feedback(comment) 정보를 담고있는 message를 반환한다.
     * @param {object} msg
     * @returns {*}
     * @private
     */
    function getFeedbackMessage(msg) {
      return centerService.isCommentType(msg.message.contentType) ? msg.feedback : msg.message;
    }

    /**
     * msg 에서 feedback(comment) 정보를 담고있는 content를 반환한다.
     * @param {object} msg
     * @returns {*}
     * @private
     */
    function getFeedbackContent(msg) {
      return centerService.isCommentType(msg.message.contentType) ? msg.feedback.content : msg.message.content;
    }

    /**
     * get comment count
     * @param {object} msg
     * @returns {*|number}
     */
    function getCommentCount(msg) {
      var message = getFeedbackMessage(msg);
      return message.commentCount || 0;
    }

    /**
     * file render data를 preview 가능한 data로 변환함
     * @param {object} options
     * @param {object} data
     */
    function convertToPreview(data, options) {
      if (_isImagePreview(options.hasOriginalImage, options.isMustPreview)) {
        _convertImagePreview(data);
      } else if (options.hasPdfPreview) {
        _convertPdfPreview(data);
      }
    }

    /**
     * image preview 여부
     * @param {boolean} hasOriginalImage
     * @param {boolean} isMustPreview
     * @returns {*|boolean}
     * @private
     */
    function _isImagePreview(hasOriginalImage, isMustPreview) {
      return hasOriginalImage && !isMustPreview;
    }

    /**
     * convert image preview
     * @param {object} data
     * @private
     */
    function _convertImagePreview(data) {
      data.file.mustPreview = true;
      data.file.hasPreview = true;
      data.file.imageUrl = '../assets/images/preview_image.png';
      data.file.width = 740;
      data.file.height = 283;
      data.file.isIcon = true;
    }

    /**
     * convert pdf preview
     * @param {object} data
     * @private
     */
    function _convertPdfPreview(data) {
      data.file.mustPreview = true;
      data.file.hasPreview = true;
      data.file.imageUrl = '../assets/images/preview_pdf.png';
      data.file.width = 740;
      data.file.height = 283;
      data.file.isIcon = true;
    }
  }
})();
