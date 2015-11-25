/**
 * @fileoverview image를 보여주는 처리를 한다.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('imageView', imageView);

  /* @ngInject */
  function imageView(Loading) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, jqEle, attrs) {
      // image view에서 request할 url
      var imageView = attrs.imageView;

      // image view의 max width
      var imageMaxWidth = parseInt(attrs.imageMaxWidth, 10);

      // image view의 max height
      var imageMaxHeight = parseInt(attrs.imageMaxHeight, 10);

      // image view width
      var imageWidth = parseInt(attrs.imageWidth, 10) || imageMaxWidth;

      // image view height
      var imageHeight = parseInt(attrs.imageHeight, 10) || imageMaxHeight;

      // image view에서 image 불러오는중 loading bar 사용여부
      var hasLoadingBar = attrs.hasLoadingBar === 'true';

      var jqLoadingBar;
      var jqImage;
      var dimention = _getDimention();

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        _setImageBasket();

        if (hasLoadingBar) {
          _createLoadingBar();
        }

        if (_.isString(imageView)) {
          _createImage();
        }
      }

      /**
       * loading bar를 생성한 후 view에 출력한다.
       * @private
       */
      function _createLoadingBar() {
        jqLoadingBar = $('<div class="loading-bar-wrapper" ' +
                              'style="width:' + dimention.width + 'px;height:' + dimention.height + 'px;">' +
                            Loading.getTemplate() +
                         '</div>')
          .appendTo(jqEle);
      }

      /**
       * image를 생성한 후 view에 출력한다.
       * @private
       */
      function _createImage() {
        jqImage = $('<img class="opac-zero" ' +
                         'style="display:none;width:' + dimention.width + 'px;height:' + dimention.height + 'px;" ' +
                         'src="' + imageView + '">')
          .on('load', _onImageLoad)
          .appendTo(jqEle);
      }

      /**
       * image 불러오기 완료
       * @private
       */
      function _onImageLoad() {
        // image 불러온 직후 loading bar 바로 삭제
        jqLoadingBar && jqLoadingBar.remove();

        jqImage
          .show()
          .addClass('opac-in');
      }

      /**
       * image 불러오기전 view에 image dimention 만큼 공간을 설정한다.
       * @private
       */
      function _setImageBasket() {
        jqEle.css({
          width: dimention.width,
          height: dimention.height
        });
      }

      /**
       * view에 출력할 image dimention을 전달한다.
       * @returns {{width: number, height: number}}
       * @private
       */
      function _getDimention() {
        var ratio;

        if (imageMaxWidth < imageWidth || imageMaxHeight < imageHeight) {
          // maxWidth, maxHeight 보다 imageWidth, imageHeight가 크다면 비율 조정 필요함.
          ratio = [imageMaxWidth / imageWidth, imageMaxHeight / imageHeight];
          ratio = Math.min(ratio[0], ratio[1]);
        } else {
          ratio = 1;
        }

        return {
          width: imageWidth * ratio,
          height: imageHeight * ratio
        };
      }
    }
  }
})();
