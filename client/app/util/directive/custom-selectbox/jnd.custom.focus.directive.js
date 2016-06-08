/**
 * @fileoverview compile 시 { } syntax 를 무시하는 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndCustomFocus', jndCustomFocus);

  function jndCustomFocus($timeout, JndUtil, jndKeyCode, CoreUtil) {
    return {
      restrict: 'A',
      link: link,
      scope: {
        'selectedValue': '=jndDataSelected',
        'onChange': '=jndCustomFocus',
        'key': '@jndDataKey',
        'close': '=jndCallbackClose'
      }
    };
   function link(scope, el, attrs) {
     var _jqCurrent;
     var _jqInput;
     _init();

     /**
      * 생성자
      * @private
      */
     function _init() {
       scope.key = scope.key || 'value';
       _attachEvents();
       _attachDomEvents();
       _jqInput = el.find('input:first');

       $timeout(_initialSelect);
     }

     /**
      * event handler 를 attach 한다
      * @private
      */
     function _attachEvents() {
       scope.$on('custom-focus:blur', _blur);
       scope.$on('custom-focus:focus', _onFocus);
       scope.$on('custom-focus:focus-value', _onFocusByValue);
       scope.$on('custom-focus:focus-item', _onFocusByItem);
       scope.$on('custom-focus:focus-next', _focusNext);
       scope.$on('custom-focus:focus-prev', _focusPrev);
     }

     /**
      * dom 이벤트 핸들러를 attach 한다
      * @private
      */
     function _attachDomEvents() {
       el.on('keydown', _onKeyDown);
       el.on('keyup', _onKeyUp);
       el.on('mouseover', _onMouseOver);
       el.on('click', _onClick);
     }

     /**
      * mouse over 이벤트 핸들러
      * @param {Event} mouseEvent
      * @private
      */
     function _onMouseOver(mouseEvent) {
       var jqTarget = $(mouseEvent.target);
       var jqSelectable = jqTarget.closest('._selectable');
       if (jqSelectable.length) {
         _focus(jqSelectable);
       }
     }

     /**
      * click 이벤트 핸들러
      * @param {Event} mouseEvent
      * @private
      */
     function _onClick(mouseEvent) {
       var jqTarget = $(mouseEvent.target);
       var jqSelectable = jqTarget.closest('._selectable');
       if (jqSelectable.length) {
         _select(jqSelectable, false, mouseEvent);
       }
       _jqInput.focus();
     }

     /**
      * keyup 이벤트 핸들러
      * @private
      */
     function _onKeyUp() {
       $timeout(function() {
         _focus();
       });
     }

     /**
      * select 한다
      * @param {object} [jqTarget] - select 할 jquery 엘리먼트
      * @param {boolean} [isInitial=false] - 처음 select 인지 여부
      * @param {object} [mouseEvent] - 마우스 이벤트
      * @private
      */
     function _select(jqTarget, isInitial, mouseEvent) {
       jqTarget = jqTarget || _jqCurrent;
       if (_.isFunction(scope.onChange)) {
         JndUtil.safeApply(scope, function() {
           scope.onChange(jqTarget, angular.element(jqTarget).scope(), mouseEvent);
           if (!isInitial) {
             _close();
           } else {
             jqTarget.addClass('selected');
           }
         });
       }
     }

     /**
      * selectbox 를 닫는다
      */
     function _close() {
       if (_.isFunction(scope.close)) {
         scope.close();
       }
     }

     /**
      * 초기 select 될 item을 설정한다
      * @private
      */
     function _initialSelect() {
       var jqTarget;
       if (scope.selectedValue) {
         jqTarget = _getTargetByValue(scope.selectedValue);
       }

       _focus(jqTarget);
       _toScrollTop();

       _select(_jqCurrent, true);
     }

     /**
      * value 값으로 해당 element 를 반환한다
      * @param {number|string} value
      * @returns {*}
      * @private
      */
     function _getTargetByValue(value) {
       var jqList = el.find('._selectable');
       var jqEl;
       var jqTarget = jqList.eq(0);

       _.forEach(jqList, function (el, index) {
         jqEl = $(el);
         if (CoreUtil.pick(jqEl.data('item'), scope.key) == value) {
           jqTarget = jqEl;
           return false;
         }
       });
       return jqTarget;
     }

     /**
      * keydown 이벤트 핸들러
      * @param {object} keyEvent
      * @private
      */
     function _onKeyDown(keyEvent) {
       var keyCode = keyEvent.keyCode;
       if (jndKeyCode.match('ESC', keyCode)) {
         JndUtil.safeApply(scope, _close);
         _preventEventBubbling(keyEvent);
       } else if (jndKeyCode.match('ENTER', keyCode)) {
         _select();
         _preventEventBubbling(keyEvent);
       } else if (jndKeyCode.match('DOWN_ARROW', keyCode)) {
         _focusNext();
         _preventEventBubbling(keyEvent);
       } else if (jndKeyCode.match('UP_ARROW', keyCode)) {
         _focusPrev();
         _preventEventBubbling(keyEvent);
       } else if (jndKeyCode.match('PAGE_UP', keyCode)) {
         //_focusNextPage();
       } else if (jndKeyCode.match('PAGE_DOWN', keyCode)) {
         //_focusPrevPage();
       }
     }

     /**
      * event bubbling 을 방지한다
      * @param {object} domEvent
      * @private
      */
     function _preventEventBubbling(domEvent) {
       domEvent.preventDefault();
       domEvent.stopPropagation();
     }

     /**
      * focus 이벤트 핸들러
      * @param {object} angularEvent
      * @param {object} jqTarget
      * @private
      */
     function _onFocus(angularEvent, jqTarget) {
       _focus(jqTarget);
     }

     /**
      * item 에 해당하는 element 에 focus 처리 한다.
      * @param {object} angularEvent
      * @param {object} item
      * @private
      */
     function _onFocusByItem(angularEvent, item) {
       _onFocusByValue(angularEvent, item[scope.key]);
     }
     
     /**
      * value 값을 이용하여 focus 한다
      * @param {object} angularEvent
      * @param {number|string} value
      * @private
      */
     function _onFocusByValue(angularEvent, value) {
       _focus(_getTargetByValue(value));
     }

     /**
      * 현재 focus 된 element 가 존재하는지 여부를 반환한다
      * @returns {boolean}
      * @private
      */
     function _hasFocus() {
       return !!(_jqCurrent && _jqCurrent.length);
     }

     /**
      * 다음 item 에 focus 한다
      * @private
      */
     function _focusNext() {
       var jqList = el.find('._selectable');
       var jqEl;
       var jqTarget = jqList.eq(0);
       var jqNext;
       if (_hasFocus()) {
         _.forEach(jqList, function (el, index) {
           jqEl = $(el);
           jqNext = jqList.eq(index + 1);
           if (jqEl.is(_jqCurrent) && jqNext && jqNext.length) {
             jqTarget = jqNext;
             return false;
           }
         });
       }
       _focus(jqTarget);
     }

     /**
      * 이전 element 에 focus 처리한다
      * @private
      */
     function _focusPrev() {
       var jqList = el.find('._selectable');
       var jqEl;
       var jqTarget = jqList.last();
       var jqPrev;
       if (_hasFocus()) {
         _.forEachRight(jqList, function (el, index) {
           jqEl = $(el);
           jqPrev = jqList.eq(index - 1);
           if (jqEl.is(_jqCurrent) && jqPrev && jqPrev.length) {
             jqTarget = jqPrev;
             return false;
           }
         });
       } else {
         jqTarget = jqList.eq(0);
       }
       _focus(jqTarget);
     }

     /**
      * blur 처리한다
      * @private
      */
     function _blur() {
       el.find('._selectable').removeClass('active');
     }

     /**
      * 대상 target 에 focus 처리한다
      * @param {object} jqTarget
      * @private
      */
     function _focus(jqTarget) {
       _blur();
       if (jqTarget && jqTarget.length) {
         _jqCurrent = jqTarget;
       } else if (!_jqCurrent || !_jqCurrent.length || _jqCurrent.is(':hidden')) {
         _jqCurrent = el.find('._selectable:first');
       }

       _jqCurrent.addClass('active');
       _adjustScroll();
       _jqInput.focus();
     }

     /**
      * scroll 위치를 조정한다
      * @private
      */
     function _adjustScroll() {
       var jqContainer = _jqCurrent.closest('._container');
       var scrollTop = jqContainer.scrollTop();
       if (jqContainer.length) {
         jqContainer.scrollTop(scrollTop + _getDifference());
       }
     }

     /**
      * 최 상단 scroll 로 돌아가도록 수정
      * @param {object} jqTarget
      * @private
      */
     function _toScrollTop(jqTarget) {
       jqTarget = jqTarget || _jqCurrent;
       var jqContainer = jqTarget.closest('._container');
       var scrollTop = jqContainer.scrollTop();
       var currentOffset = jqTarget.offset();
       var offset = jqContainer.offset();
       var difference = currentOffset.top - offset.top;
       if (jqContainer.length) {
         jqContainer.scrollTop(scrollTop + difference);
       }
     }

     /**
      * scroll 위치를 조정하기 위한 오차값을 반환한다
      * @returns {number}
      * @private
      */
     function _getDifference() {
       var jqContainer = _jqCurrent.closest('._container');
       var offset = jqContainer.offset();
       var height = jqContainer.outerHeight();

       var currentOffset = _jqCurrent.offset();
       var currentHeight = _jqCurrent.outerHeight();

       var difference = 0;

       if (offset.top > currentOffset.top) {
         difference = currentOffset.top - offset.top;
       } else if (offset.top + height < currentOffset.top + currentHeight) {
         difference = (currentOffset.top + currentHeight) - (offset.top + height);
       }
       return difference;
     }
   }

  }
})();


