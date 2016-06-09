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

      var isTitle = messageCollection.isTitleComment(index);
      var isChild = messageCollection.isChildComment(index);
      var isFirst = messageCollection.isFirstComment(index);
      var isLast = messageCollection.isLastComment(index);

      var template = isTitle ? _templateTitle : _template;

      var commentCount = RendererUtil.getCommentCount(msg);

      var feedback = RendererUtil.getFeedbackMessage(msg);

      var hasOriginalImage = !!(feedback.content && feedback.content.extraInfo);
      var isMustPreview = $filter('mustPreview')(content);
      var hasPreview = $filter('hasPreview')(content);
      var hasPdfPreview = FileDetail.hasPdfPreview(feedback);

      var data = {
        css: {
          last: isLast ? 'last' : '',
          unshared: isUnshared ? 'unshared' : '',
          archived: isArchived ? 'archived' : '',
          star: RendererUtil.getStarCssClass(msg.message),
          starIcon: msg.message.isStarred ? 'icon-star-on' : 'icon-star-off',
          disabledMember: RendererUtil.getDisabledMemberCssClass(msg),
          fileStar: RendererUtil.getStarCssClass(feedback),
          fileStarIcon: feedback.isStarred ? 'icon-star-on' : 'icon-star-off'
        },
        attrs: {
          download: RendererUtil.getFileDownloadAttrs(msg)
        },
        file: {
          id: msg.feedbackId,
          isUnshared: isUnshared,
          hasPermission: hasPermission,
          icon: icon,
          mustPreview: isMustPreview,
          hasPreview: hasPreview,
          imageUrl: $filter('getPreview')(content, 'large'),
          smallImageUrl: $filter('getPreview')(content, 'small'),
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
        hasChild: messageCollection.hasChildComment(index),
        isTitle: isTitle,
        isFirst: isFirst,
        isLast: isLast,
        isArchived: isArchived,
        isAllowDelete: _isAllowDelete(msg),
        translate: {
          commentAllDesc: _getCommentAllDesc(msg.feedbackId, commentCount)
        },
        msg: msg
      };

      if (hasPreview && content.extraInfo) {
        _setExtraInfo(data.file, content.extraInfo);
      }

      RendererUtil.convertToPreview(data, {
        hasImagePreview: hasOriginalImage && !isMustPreview,
        hasPdfPreview: hasPdfPreview
      });

      return {
        conditions: _getConditions(isTitle, isChild, isFirst, isLast),
        template: template(data)
      };
    }

    /**
     * message의 상태들 전달함
     * @param {boolean} isTitle
     * @param {boolean} isChild
     * @param {boolean} isFirst
     * @param {boolean} isLast
     * @returns {array}
     * @private
     */
    function _getConditions(isTitle, isChild, isFirst, isLast) {
      var conditions = ['non-selectable'];

      if (isTitle) {
        conditions.push('message-group');
      } else {
        conditions.push('message');
        conditions.push('comment');

        if (isChild) {
          conditions.push('comment-child');
        }

        if (isFirst) {
          conditions.push('first');
        }

        if (isLast) {
          conditions.push('last');
        }
      }

      return conditions;
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

    /**
     * 삭제 가능여부
     * @param {object} msg
     * @returns {boolean|*}
     * @private
     */
    function _isAllowDelete(msg) {
      return msg.message.writerId === memberService.getMemberId() ||
          memberService.isAdmin();
    }
  }
})();
