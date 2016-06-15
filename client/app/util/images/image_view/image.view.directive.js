/**
 * @fileoverview image를 보여주는 처리를 한다.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('imageView', imageView);

  /* @ngInject */
  function imageView($parse, Loading) {
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

      var imageOrientation = parseInt(attrs.imageOrientation, 10);

      var onImageLoadCallback = $parse(attrs.onImageLoad);

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
        jqLoadingBar = $('<div class="loading-content">' + Loading.getTemplate() + '</div>')
          .css({width: dimention.width, height: dimention.height})
          .prependTo(jqEle);
      }

      /**
       * image를 생성한 후 view에 출력한다.
       * @private
       */
      function _createImage() {
        jqImage = $('<img class="opac-zero" src="' + imageView + '">')
          .css({width: dimention.width, height: dimention.height})
          .one('load', _onImageLoad)
          .prependTo(jqEle);
      }

      /**
       * image 불러오기 완료
       * @private
       */
      function _onImageLoad() {
        // image 불러온 직후 loading bar 바로 삭제
        jqLoadingBar && jqLoadingBar.remove();

        jqImage.addClass('opac-in');

        onImageLoadCallback(scope);
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
        var temp;

        // orientation 처리 참조: http://www.impulseadventure.com/photo/exif-orientation.html
        if (_.isNumber(imageOrientation) && imageOrientation > 4) {
          temp = imageWidth;
          imageWidth = imageHeight;
          imageHeight = temp;
        }

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
