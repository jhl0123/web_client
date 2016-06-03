/**
 * @fileoverview file detail preview directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailPreview', fileDetailPreview);

  function fileDetailPreview($filter, ExternalFile, modalHelper, JndPdfViewer, FileDetail) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        file: '=',
        originalUrl: '=',
        isIntegrateFile: '='
      },
      link: link,
      templateUrl : 'app/right/file-detail/preview/file.detail.preview.html'
    };

    function link(scope, el) {
      var _fileDetail = scope.file;
      var _content = _fileDetail.content;

      var _fileIcon = $filter('fileIcon')(_content);

      // preview width
      scope.width = undefined;

      // preview height
      scope.height = undefined;

      // preview orientation
      scope.orientation = undefined;

      scope.onImageClick = onImageClick;
      scope.onImageLoad = onImageLoad;
      scope.onExternalShareClick = onExternalShareClick;
      scope.loadPdf = loadPdf;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        if (_content.extraInfo) {
          scope.width = _content.extraInfo.width;
          scope.height = _content.extraInfo.height;
          scope.orientation = _content.extraInfo.orientation;
        }

        _setImage(_content);
        _setFileType();
      }

      /**
       * pdf 를 load 한다.
       */
      function loadPdf() {
        JndPdfViewer.load(scope.originalUrl, scope.file);
      }

      /**
       * 클릭시 동작 구별을 위해 file type 을 분류한다. 
       * @private
       */
      function _setFileType() {
        if (scope.hasImagePreview) {
          scope.type = 'image-preview';
        } else if (FileDetail.hasPdfPreview(_fileDetail)) {
          scope.type = 'pdf';
        } else {
          scope.type = 'etc';
        }
      }
      
      /**
       * file detail에서 preview 공간에 들어갈 image의 url을 설정한다.
       * @param {object} content
       * @private
       */
      function _setImage(content) {
        if (hasImagePreview(content)) {
          scope.isImageLoading = true;
          scope.imageUrl = $filter('getPreview')(content, 'large');
          scope.previewCursor = 'zoom-in';
        } else {
          scope.imageUrl = $filter('getFilterTypePreview')(content);
          scope.previewCursor = 'pointer'
        }

        el.find('.preview-body').css('cursor', scope.previewCursor);
      }

      /**
       * image preview 가졌는지 여부
       * @param {object} content
       * @returns {boolean}
       */
      function hasImagePreview(content) {
        var hasImagePreview = _fileIcon === 'img' &&
              content.icon !== 'etc' &&
              !!(content.extraInfo && content.extraInfo.largeThumbnailUrl);

        return scope.hasImagePreview = hasImagePreview;
      }

      /**
       * image click event handler
       */
      function onImageClick() {
        if (scope.hasImagePreview) {
          modalHelper.openImageCarouselModal({
            // image file api data
            messageId: _fileDetail.id,
            // image carousel view data
            userName: _fileDetail.extWriter.name,
            uploadDate: _fileDetail.createTime,
            fileTitle: _content.title,
            fileUrl: _content.fileUrl,
            extraInfo: _content.extraInfo,
            // single
            isSingle: true
          });
        }
      }

      /**
       * image loaded event handler
       */
      function onImageLoad() {
        scope.isImageLoading = false;
      }

      /**
       * external share click event handler
       */
      function onExternalShareClick() {
        ExternalFile.openShareDialog(_content);
      }
    }
  }
})();
