/**
 * @fileoverview FILE renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('FileRenderer', FileRenderer);

  /* @ngInject */
  function FileRenderer($filter, modalHelper, MessageCacheCollection, RendererUtil, JndPdfViewer, FileDetail, 
                        fileAPIservice, jndPubSub, AnalyticsHelper, currentSessionHelper, publicService) {
    var messageHeightMap = {};
    var _template = '';

    this.render = render;

    /**
     * center 에서 delegate 하여 처리할 핸들러를 정의한다.
     * @type {{click: _onClick}}
     */
    this.delegateHandler = {
      'click': _onClick
    };

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      _template = Handlebars.templates['center.file'];
    }

    /**
     * click 이벤트 핸들러
     * @param {Object} clickEvent
     * @private
     */
    function _onClick(clickEvent) {
      var messageCollection = MessageCacheCollection.getCurrent();
      var jqTarget = $(clickEvent.target);
      var jqMessage = jqTarget.closest('.message');
      var id = jqMessage.attr('id');
      var msg = messageCollection.get(id);

      if (jqTarget.closest('._fileDownload').length) {
        _onClickFileDownload(msg);
      } else if (jqTarget.closest('._fileMore').length) {
        _onClickFileMore(msg, jqTarget);
      } else if (jqTarget.closest('._previewToggle').length) {
        _onClickPreviewToggle(msg, jqMessage);
      } else if (jqTarget.closest('._previewExpand').length) {
        _onClickPreviewExpand(msg);
      }
    }

    /**
     * preview toggle click event handler
     * @param {object} msg
     * @param {object} jqMessage
     * @private
     */
    function _onClickPreviewToggle(msg, jqMessage) {
      var jqCardContent = jqMessage.find('.card-content');
      var jqPreviewImage = jqMessage.find('.preview-image');

      if (jqCardContent.hasClass('open')) {
        messageHeightMap[msg.id] = jqPreviewImage.height();

        jqPreviewImage.height(12);
        jqCardContent.removeClass('open');
      } else {
        jqPreviewImage.height(messageHeightMap[msg.id]);
        jqCardContent.addClass('open');
      }
    }

    /**
     * preview expand click event handler
     * @param {object} msg
     * @private
     */
    function _onClickPreviewExpand(msg) {
      var message = RendererUtil.getFeedbackMessage(msg);

      if (FileDetail.hasPdfPreview(message)) {
        // pdf preview

        _openPdfPreview(message);
      } else {
        // image preview

        _openImagePreview(msg, message);
      }
    }

    /**
     * pdf preview 보기 열림
     * @param {object} message
     * @private
     */
    function _openPdfPreview(message) {
      JndPdfViewer.load(message.content.fileUrl, message);
    }

    /**
     * thumbnail image를 original image로 보기 열림
     * @param {object} message
     * @private
     */
    function _openImagePreview(msg, message) {
      var content = message.content;
      var currentEntity = currentSessionHelper.getCurrentEntity();

      modalHelper.openImageCarouselModal({
        // server api
        getImage: fileAPIservice.getImageListOnRoom,

        // image file api data
        messageId: message.id,
        entityId: currentEntity.entityId || currentEntity.id,
        // image carousel view data
        userName: $filter('getName')(message.writerId),
        uploadDate: msg.time,
        fileTitle: content.title,
        fileUrl: content.fileUrl,
        extraInfo: content.extraInfo,
        // single file
        isSingle: msg.status === 'unshared'
      });
    }

    /**
     * file download 클릭 이벤트 핸들러
     * @param {object} msg
     * @private
     */
    function _onClickFileDownload(msg) {
      AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DOWNLOAD, {
        'FILE_ID': msg.message.id
      });
    }

    /**
     * file more 이벤트 핸들러
     * @param {object} msg
     * @param {object} jqTarget
     * @private
     */
    function _onClickFileMore(msg, jqTarget) {
      jndPubSub.pub('show:center-file-dropdown', {
        target: jqTarget,
        msg: msg,
        isIntegrateFile: RendererUtil.isIntegrateFile(msg)
      });
    }

    /**
     * index 에 해당하는 메세지를 랜더링한다.
     * @param {number} index
     * @returns {*}
     */
    function render(index) {
      var messageCollection = MessageCacheCollection.getCurrent();
      var msg = messageCollection.list[index];
      var content = msg.message.content;
      var icon = $filter('fileIcon')(content);
      var isArchived = (msg.message.status === 'archived');
      var isUnshared = publicService.isFileUnshared(msg);
      var hasPermission = publicService.hasFilePermission(msg);
      var feedback = RendererUtil.getFeedbackMessage(msg);

      var hasOriginalImage = !!(feedback.content && feedback.content.extraInfo);
      var isMustPreview = $filter('mustPreview')(content);
      var hasPreview = $filter('hasPreview')(content);
      var hasPdfPreview = FileDetail.hasPdfPreview(feedback);

      var data;

      data = {
        css: {
          unshared: isUnshared ? 'unshared' : '',
          archived: isArchived ? 'archived' : '',
          star: RendererUtil.getStarCssClass(msg.message),
          starIcon: msg.message.isStarred ? 'icon-star-on' : 'icon-star-off',
          disabledMember: RendererUtil.getDisabledMemberCssClass(msg)
        },
        attrs: {
          download: RendererUtil.getFileDownloadAttrs(msg)
        },
        file: {
          id: msg.message.id,
          isUnshared: isUnshared,
          hasPermission: hasPermission,
          icon: icon,
          mustPreview: isMustPreview,
          hasPreview: hasPreview,
          hasPdfPreview: hasPdfPreview,
          imageUrl: $filter('getPreview')(content, 'large'),
          smallImageUrl: $filter('getPreview')(content, 'small'),
          title: $filter('fileTitle')(content),
          type: $filter('fileType')(content),
          size: $filter('bytes')(content.size),
          isIntegrateFile: RendererUtil.isIntegrateFile(msg),
          commentCount: RendererUtil.getCommentCount(msg),
          writerName: $filter('getName')(msg.message.writerId),
          time: $filter('getyyyyMMddformat')(feedback.createTime)
        },
        isArchived: isArchived,
        msg: msg
      };

      if (isMustPreview && content.extraInfo) {
        _setExtraInfo(data.file, content.extraInfo);
      }

      RendererUtil.convertToPreview(data, {
        hasImagePreview: hasOriginalImage && !isMustPreview,
        hasPdfPreview: hasPdfPreview
      });

      return {
        conditions: ['file'],
        template: _template(data)
      };
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
  }
})();
