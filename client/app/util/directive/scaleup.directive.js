/**
 * @fileoverview scale up animation 을 수행하는 directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('scaleUp', scaleUp);

  /**
   * on-load-scale-up directive
   * on load 이벤트 발생시 scale up 에니메이션을 수행한다.
   *
   * @returns {{restrict: string, scope: {src: string}, link: link}}
   * @example

   <img src="xxx.com"
   on-load-scale-up
   duration="300"
   start-width="30"
   start-height="30"
   end-width="100"
   end-height="100" />

   */
  function scaleUp() {
    return {
      restrict: 'A',
      scope: {
        src: '=scaleUpSrc'
      },
      link: link
    };

    function link(scope, el, attrs) {
      var _duration = attrs.duration || 200;
      var _startWidth = attrs.startWidth || 0;
      var _startHeight = attrs.startHeight || 0;
      var _endWidth = attrs.endWidth || 126;
      var _endHeight = attrs.endHeight || 126;

      var _marginVertical;
      var _marginHorizontal;
      var _image;

      _init();

      /**
       * 초기화 함수
       * @private
       */
      function _init() {
        _initVariables();
        el.parent().css('min-height', el.height());

        _attachScopeEvents();
      }

      /**
       * attach scope events
       * @private
       */
      function _attachScopeEvents() {
        scope.$watch('src', _beforeAnimate);
      }

      /**
       * 변수를 초기화 한다.
       * @private
       */
      function _initVariables() {
        var heightDiff = _endHeight - _startHeight;
        var widthDiff = _endWidth - _startWidth;

        _marginVertical = Math.floor(heightDiff / 2);
        _marginHorizontal = Math.floor(widthDiff / 2);

        //odd

        if (heightDiff % 2) {
          _startHeight++;
        }
        if (widthDiff % 2) {
          _startWidth++;
        }
      }

      /**
       * animate 시작 전 scale 을 설정한다..
       * @param {string} src
       * @private
       */
      function _beforeAnimate(src) {
        el.css({
          width: _startHeight + 'px',
          height: _startWidth + 'px',
          marginLeft: _marginHorizontal + 'px',
          marginTop: _marginVertical + 'px',
          backgroundImage: 'url(' + src + ')'
        });

        _image = new Image();
        _image.onload = function() {
          _animate();
        };
        _image.src = src;
      }

      /**
       * animate를 시작한다.
       * @private
       */
      function _animate() {
        el.animate({
          width: _endWidth,
          height: _endHeight,
          marginLeft: 0,
          marginTop: 0
        }, _duration);
      }
    }
  }
})();
