/**
 * @fileoverview jandi textarea elastic 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndElastic', jndElastic);


  function jndElastic($timeout, $parse, Browser, jndPubSub) {
    return {
      restrict: 'A',
      scope: false,
      link: link
    };
    function link(scope, el, attrs) {
      var _jqMirror;
      var _resizeTimer;
      var _height;
      var _defaultHeight;
      var _maxHeight;
      var _minHeight;
      var _paddingVertical;
      var _paddingHorizontal;

      var onChangeCallback = $parse(attrs.jndElasticOnChange);

      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        _initializeMirror();
        _attachEvents();
        _attachDomEvents();
        _resize();
      }

      /**
       * 이벤트 리스너를 바인딩한다.
       * @private
       */
      function _attachEvents() {
        scope.$on('$destroy', _onDestroy);
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _detachDomEvents();
      }

      /**
       * 높이를 계산할 mirror 엘리먼트를 생성한다.
       * @private
       */
      function _initializeMirror() {
        var mirrorInitStyle = 'position: absolute; top: -999px; right: auto; bottom: auto;' +
          'left: 0; overflow: scroll; -webkit-box-sizing: content-box;' +
          '-moz-box-sizing: content-box; box-sizing: content-box;' +
          'min-height: 0 !important; height: 0 !important; padding: 0;' + +
            'word-wrap: break-word; border: 0;';
        var copyStyle = [
          'fontFamily',
          'fontSize',
          'fontWeight',
          'fontStyle',
          'letterSpacing',
          'lineHeight',
          'textTransform',
          'wordSpacing',
          'textIndent'
        ];
        _defaultHeight = el.css('height') || el.height();
        _jqMirror = $('<textarea tabindex="-1" ' +
          'style="' + mirrorInitStyle + '"/>');

        _.forEach(copyStyle, function (value) {
          _jqMirror.css(value, el.css(value));
        });

        _maxHeight = parseInt(el.css('maxHeight'), 10);
        _minHeight = parseInt(el.css('minHeight'), 10);
        _paddingVertical = parseInt(el.css('paddingBottom'), 10) + parseInt(el.css('paddingTop'), 10);
        _paddingHorizontal = parseInt(el.css('paddingLeft'), 10) + parseInt(el.css('paddingRight'), 10);

        //@fixme 레이아웃이 ie 와 chrome 이 맞지 않는 현상이 발생하여 임시로 예외처리 해놓음
        if (!Browser.msie) {
          _paddingVertical = 0;
        }

        $('body').append(_jqMirror);
        _height = _jqMirror.height();
      }

      /**
       * dom 이벤트를 attach 한다.
       * @private
       */
      function _attachDomEvents() {
        el.on('propertychange change click keyup input paste', _onChange);
      }

      /**
       * dom 이벤트를 detach 한다.
       * @private
       */
      function _detachDomEvents() {
        el.off('propertychange change click keyup input paste', _onChange);
        _jqMirror.remove();
      }

      /**
       * resize 를 수행한다.
       * @private
       */
      function _resize() {
        var height;
        _jqMirror.width(el.width() + _paddingHorizontal);
        _jqMirror.val(el.val() || ' ');

        height = _jqMirror[0].scrollHeight;
        if (_maxHeight !== 0 && _maxHeight < height) {
          height = _maxHeight;
        } else if (_minHeight !== 0 && _minHeight > height) {

        } else if (height < _defaultHeight) {
          height = _defaultHeight;
        }
        if (_height !== height) {
          el.height(height + _paddingVertical);
          _height = height;
          jndPubSub.pub('elastic:resize');
        }
      }

      /**
       * onChange 이벤트 핸들러
       * @param {object} event
       * @private
       */
      function _onChange(event) {
        $timeout.cancel(_resizeTimer);
        _resizeTimer = $timeout(function() {
          onChangeCallback(scope, {
            $event: event
          });
          _resize();
        }, 50);
      }
    }
  }
})();
