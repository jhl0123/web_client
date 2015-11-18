/**
 * @fileoverview file detail preview directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailPreview', fileDetailPreview);

  function fileDetailPreview($filter, modalHelper, ExternalShareService) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        fileDetail: '=',
        fileIcon: '=',
        isIntegrateFile: '=',
        isExternalShared: '='
      },
      link: link,
      templateUrl : 'app/right/file.detail/preview/file.detail.preview.html'
    };

    function link(scope, el, attrs) {
      var fileDetail = scope.fileDetail;
      var content = fileDetail.content;

      var fileIcon = scope.fileIcon;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.onImageClick = onImageClick;
        scope.onFileDetailImageLoad = onFileDetailImageLoad;
        scope.onExternalShareClick = onExternalShareClick;

        scope.isLoadingImage = true;

        if (content) {
          _setImage(content);
        }
      }

      /**
       * file detail에서 preview 공간에 들어갈 image의 url을 설정함
       */
      function _setImage(content) {
        if (fileIcon === 'img' && content.icon !== 'etc') {
          scope.ImageUrl = $filter('getFileUrl')(content.fileUrl);
          scope.hasZoomIn = true;
          scope.previewCursor = 'zoom-in';

          // 이미지 회전에 대한 data를 전달 받지 않는 이상 자연스러운  dimention 처리는 불가능 함.
          //if (content.extraInfo) {
          //  _setImageDimension(content.extraInfo);
          //}
        } else {
          scope.ImageUrl = $filter('getFilterTypePreview')(content);
          scope.previewCursor = $filter('isIntegrationContent')(content) ? 'pointer' : 'default';
        }

        el.find('.image_wrapper').css('cursor', scope.previewCursor);
      }

      /**
       * image dimension을 설정한다.
       * @param extraInfo
       * @private
       */
      function _setImageDimension(extraInfo) {
        var maxWidth = 360;
        var maxHeight = 740;
        var width = extraInfo.width;
        var height = extraInfo.height;
        var ratio;

        if (maxWidth < width || maxHeight < height) {
          // maxWidth, maxHeight 보다 imageWidth, imageHeight가 크다면 비율 조정 필요함.
          ratio = [maxWidth / width, maxHeight / height];
          ratio = Math.min(ratio[0], ratio[1]);
        } else {
          ratio = 1;
        }

        el.css({
          width: width * ratio,
          height: height * ratio
        });
      }

      /**
       * 이미지 클릭시 이벤트 핸들러
       */
      function onImageClick($event) {
        if ($filter('isIntegrationContent')(fileDetail.content)) {
          window.open(fileDetail.content.fileUrl, '_blank');
        } else {
          if (!$($event.target).hasClass('no-image-preview') && scope.hasZoomIn) {
            modalHelper.openImageCarouselModal({
              // image file api data
              messageId: fileDetail.id,
              // image carousel view data
              userName: fileDetail.extWriter.name,
              uploadDate: fileDetail.createTime,
              fileTitle: fileDetail.content.title,
              fileUrl: fileDetail.content.fileUrl,
              // single
              isSingle: true
            });
          }
        }
      }

      /**
       * image loaded event handler
       */
      function onFileDetailImageLoad() {
        scope.$apply(function() {
          scope.isLoadingImage = false;
        });
      }

      /**
       * external share click event handler
       */
      function onExternalShareClick() {
        ExternalShareService.openShareDialog(content);
      }
    }
  }
})();
