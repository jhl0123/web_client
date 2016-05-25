/**
 * @fileoverview FILE Comment renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('FileCommentRenderer', FileCommentRenderer);

  /* @ngInject */
  function FileCommentRenderer($filter, MessageCacheCollection, RendererUtil, publicService, memberService, CoreUtil,
                               FileDetail) {
    var _templateTitle = '';
    var _template = '';

    this.render = render;

    _init();

    /**
     * 생성자 함수
     * @private
     */
    function _init() {
      _templateTitle = Handlebars.templates['center.file.comment.title'];
      _template = Handlebars.templates['center.file.comment'];
    }

    /**
     * msg 로 부터 file data 를 조회한다.
     * @param {object} msg
     * @returns {object}
     * @private
     */
    function _getFileData(msg) {
      var contentType = CoreUtil.pick(msg, 'message', 'contentType');
      var file;
      if (contentType === 'comment') {
        file = CoreUtil.pick(msg, 'feedback');
      } else {
        file = CoreUtil.pick(msg, 'message');
      }
      return file;
    }

    /**
     * pdf preview 가 있는 메시지인지 확인한다.
     * @param {object} msg
     * @returns {boolean}
     * @private
     */
    function _hasPdfPreview(msg) {
      var file = _getFileData(msg);
      return FileDetail.hasPdfPreview(file);
    }
    
    /**
     * index 에 해당하는 메세지를 랜더링한다.
     * @param {number} index
     * @returns {*}
     */
    function render(index) {
      var messageCollection = MessageCacheCollection.getCurrent();
      var msg = messageCollection.list[index];
      var content = msg.feedback.content;

      var icon = $filter('fileIcon')(content);

      var isArchived = (msg.feedback.status === 'archived');
      var isUnshared = publicService.isFileUnshared(msg, true);

      var hasPermission = publicService.hasFilePermission(msg, true);
      var isMustPreview = $filter('mustPreview')(content);
      var hasPreview = $filter('hasPreview')(content);

      var isTitle = messageCollection.isTitleComment(index);
      var isChild = messageCollection.isChildComment(index);
      var template = isTitle ? _templateTitle : _template;

      var commentCount = RendererUtil.getCommentCount(msg);

      var feedback = RendererUtil.getFeedbackMessage(msg);

      var data = {
        css: {
          unshared: isUnshared ? 'unshared' : '',
          archived: isArchived ? 'archived' : '',
          wrapper: isTitle ? 'comment-title' : 'comment-continue',
          star: RendererUtil.getStarCssClass(msg.message),
          disabledMember: RendererUtil.getDisabledMemberCssClass(msg),
          fileStar: RendererUtil.getStarCssClass(feedback)
        },
        attrs: {
          download: RendererUtil.getFileDownloadAttrs(msg)
        },
        file: {
          id: msg.feedbackId,
          isUnshared: isUnshared,
          hasPermission: hasPermission,
          icon: icon,
          hasOriginalImageView: !!(feedback.content && feedback.content.extraInfo),
          mustPreview: isMustPreview,
          hasPreview: hasPreview,
          hasPdfPreview: _hasPdfPreview(msg),
          imageUrl: $filter('getPreview')(content, 'large'),
          title: $filter('fileTitle')(content),
          type: $filter('fileType')(content),
          size: $filter('bytes')(content.size),
          isIntegrateFile: RendererUtil.isIntegrateFile(msg),
          commentCount: commentCount,
          writerName: memberService.getNameById(feedback.writerId),
          time: $filter('getyyyyMMddformat')(feedback.createTime)
        },
        hasCommentAllDesc: commentCount > 0 && !isArchived && hasPermission,
        hasStar: RendererUtil.hasStar(msg),
        isSticker: RendererUtil.isSticker(msg),
        isChild: isChild,
        isTitle: isTitle,
        isArchived: isArchived,
        translate: {
          commentAllDesc: _getCommentAllDesc(msg.feedbackId, commentCount)
        },
        msg: msg
      };

      if (hasPreview && content.extraInfo) {
        _setExtraInfo(data.file, content.extraInfo);
      }

      return template(data);
    }

    /**
     * set extraInfo
     * @param {object} file
     * @param {object} extraInfo
     * @private
     */
    function _setExtraInfo(file, extraInfo) {
      file.width = extraInfo.width;
      file.height = extraInfo.height;
      file.orientation = extraInfo.orientation;
    }

    /**
     * get comment all desc
     * @private
     */
    function _getCommentAllDesc(fileId, commentCount) {
      var text = $filter('translate')('@comment-all-desc');

      return text.replace('{{commentCount}}', function() {
        return '<span class="comment-count-' + fileId + '">' + commentCount + '</span>';
      });
    }
  }
})();
