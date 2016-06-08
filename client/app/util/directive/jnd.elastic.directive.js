/**
 * @fileoverview jandi textarea elastic 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndElastic', jndElastic);


  function jndElastic($filter, $timeout, $parse, Browser, Dialog, jndPubSub) {
    return {
      restrict: 'A',
      scope: false,
      link: link
    };
    function link(scope, el, attrs) {
      var _copyStyle = [
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

      var _jqMirror;
      var _resizeTimer;
      var _height;
      var _defaultHeight;
      var _maxHeight;
      var _minHeight;
      var _paddingVertical;
      var _paddingHorizontal;

      var _name = attrs.jndElastic;
      var _maxLength = attrs.jndElasticMaxLength;

      var _prevInputLength;
      
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
        scope.$on('jndElastic:resetStyle:' + _name, _onResetStyle);
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
       * reset style
       * @private
       */
      function _onResetStyle() {
        _setMirrorStyle();
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

        _defaultHeight = el.css('height') || el.height();
        _jqMirror = $('<textarea tabindex="-1" ' +
          'style="' + mirrorInitStyle + '"/>');

        _setMirrorStyle();

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

        if (_maxHeight !== 0 && _.isNumber(_maxHeight)) {
          if (_maxHeight < height) {
            height = _maxHeight;
            el.css('overflowY', 'auto');
          } else {
            el.css('overflowY', 'hidden');
          }
        }

        if (height < _defaultHeight) {
          height = _defaultHeight;
        }

        if (_height !== height) {
          el.height(height + _paddingVertical);
          _height = height;
          jndPubSub.pub('elasticResize:' + _name);
        }
      }

      /**
       * set mirror style
       * @private
       */
      function _setMirrorStyle() {
        _.forEach(_copyStyle, function (value) {
          _jqMirror.css(value, el.css(value));
        });
      }

      /**
       * onChange 이벤트 핸들러
       * @param {object} event
       * @private
       */
      function _onChange(changeEvent) {
        $timeout.cancel(_resizeTimer);
        _resizeTimer = $timeout(function() {
          if (_isExceededMaxLength(changeEvent)) {
            Dialog.error({
              title: $filter('translate')('@message-exceeded-max-length')
            });
          }

          onChangeCallback(scope, {
            $event: changeEvent
          });
          _resize();
        }, 50);
      }

      /**
       * max length 초과여부
       * @param {object} changeEvent
       * @returns {boolean}
       * @private
       */
      function _isExceededMaxLength(changeEvent) {
        var inputLength = changeEvent.target.value.length;
        var isExceeded = false;

        if (_maxLength != null && changeEvent.type === 'input') {
          if (_prevInputLength === +_maxLength && inputLength === +_maxLength) {
            isExceeded = true;
          }
          _prevInputLength = changeEvent.target.value.length;
        }

        return isExceeded;
      }
    }
  }
})();
