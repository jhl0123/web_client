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
    this.events = {
      'click': [
        {
          currentTarget: '._fileDownload',
          handler: _onClickFileDownload
        },
        {
          currentTarget: '._fileMore',
          handler: _onClickFileMore
        },
        {
          currentTarget: '._previewToggle',
          handler: _onClickPreviewToggle
        },
        {
          currentTarget: '._previewExpand',
          handler: _onClickPreviewExpand
        },
        {
          currentTarget: '._commentText',
          handler: _onClickCommentContent
        },
        {
          currentTarget: '._commentActions',
          handler: _onClickCommentContent
        }
      ]
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
     * preview toggle click event handler
     * @param {object} clickEvent
     * @param {object} data
     * @private
     */
    function _onClickPreviewToggle(clickEvent, data) {
      var jqCardContent = data.jqMessage.find('.card-content');
      var jqPreviewImage = data.jqMessage.find('.preview-image');

      // preview toggle 클릭시 image 또는 pdf preview가 수행되지 않도록 한다.
      clickEvent.stopPropagation();

      if (jqCardContent.hasClass('open')) {
        messageHeightMap[data.msg.id] = jqPreviewImage.height();

        jqPreviewImage.height(12);
        jqCardContent.removeClass('open');
      } else {
        jqPreviewImage.height(messageHeightMap[data.msg.id]);
        jqCardContent.addClass('open');
      }
    }

    /**
     * preview expand click event handler
     * @param {object} clickEvent
     * @param {object} data
     * @private
     */
    function _onClickPreviewExpand(clickEvent, data) {
      var message = RendererUtil.getFeedbackMessage(data.msg);

      if (FileDetail.hasPdfPreview(message)) {
        // pdf preview

        _openPdfPreview(message);
      } else {
        // image preview

        _openImagePreview(data.msg, message);
      }
    }

    /**
     * comment content click event handler
     * @param {object} clickEvent
     * @private
     */
    function _onClickCommentContent(clickEvent) {
      // comment card의 경우 클릭시 오른쪽 패널이 열려야 하기 때문에 comment card의 상위 element에 오른쪽 패널이 열리는
      // delegate selector를 넣어 두었는데 그렇게 되면 comment 내용중 하나인 mention 또는 mail, href, star, delete 클릭시에도
      // 오른쪽 패널이 열리기 때문에 comment text 클릭시에는 오른쪽 패널이 열리지 않도록 stopPropagation을 수행한다.
      clickEvent.stopPropagation();
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
     * @param {object} clickEvent
     * @param {object} data
     * @private
     */
    function _onClickFileDownload(clickEvent, data) {
      AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DOWNLOAD, {
        'FILE_ID': data.msg.message.id
      });
    }

    /**
     * file more 이벤트 핸들러
     * @param {object} clickEvent
     * @param {object} data
     * @private
     */
    function _onClickFileMore(clickEvent , data) {
      jndPubSub.pub('show:center-file-dropdown', {
        target: data.jqTarget,
        msg: data.msg,
        isIntegrateFile: RendererUtil.isIntegrateFile(data.msg)
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
        conditions: ['file', 'non-selectable'],
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
