/**
 * @fileoverview file detail의 scroll directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailFloat', fileDetailFloat);

  /* @ngInject */
  function fileDetailFloat($window) {
    return {
      restrict: 'A',
      controller: 'FileDetailFloatCtrl',
      link: link
    };

    function link(scope, el, attrs, ctrl) {
      var _prevFocus;
      var _prevIsHiddenInput;

      // float input인지 여부
      ctrl.hasFloatInput = false;
      ctrl.showFloatInput = showFloatInput;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        ctrl.setJqScrollContainer(el);

        _attachDomEvents();
      }

      /**
       * attach dom events
       * @private
       */
      function _attachDomEvents() {
        el.scroll(_onScroll);
      }

      /**
       * show float input
       */
      function showFloatInput() {
        var jqInput = ctrl.getJqInput();

        jqInput.float.removeClass('show');
        _showFloatInput(jqInput.form);
        jqInput.text.focus();
      }

      /**
       * show float input
       * text input란이 file detail의 오른쪽 하단에 항상 고정되어 출력되도록 함.
       * @param {object} jqForm
       * @private
       */
      function _showFloatInput(jqForm) {
        if (!ctrl.hasFloatInput) {
          jqForm.addClass('float').appendTo(el.parent());
          // float을 넣었다가 setTimeout을 사용하여 float을 제거하여 text input에 에니메이션 효과를 부여한다.
          setTimeout(function() {
            jqForm.removeClass('float');
          });

          ctrl.hasFloatInput = true;
        }
      }

      /**
       * show static input
       * text input란이 file detail의 오른쪽 하단 마지막에 출력되도록 함
       * @param {object} jqContainer
       * @param {object} jqForm
       * @private
       */
      function _showStaticInput(jqContainer, jqForm) {
        if (ctrl.hasFloatInput) {
          jqContainer.prepend(jqForm);
          ctrl.hasFloatInput = false;
        }
      }

      /**
       * scroll event handler
       * @private
       */
      function _onScroll() {
        var jqInput = ctrl.getJqInput();
        var jqContainer = jqInput.container;
        var jqForm =  jqInput.form;
        var jqText = jqInput.text;
        var jqFloat = jqInput.float;

        var isFocus = jqText.is(':focus');
        var isHiddenInput = _isHiddenInput(jqContainer);

        if (isChanged(isFocus, isHiddenInput)) {
          if (isFocus) {
            // text input에 focus가 있는 상태에서는 float input으로 출력하도록 하는 button을 숨겨 사용자가 텍스트 입력이
            // 용이하도록 하며, text input이 scrolling을 통하여 보이지 않게되면 float input으로 출력하도록 한다.

            jqFloat.removeClass('show');

            if (isHiddenInput) {
              _showFloatInput(jqForm);
            } else {
              _showStaticInput(jqContainer, jqForm);
            }
            jqText.focus();
          } else {
            // text input에 focus가 있지 않는 상태에서는 float input으로 출력하도록 하는 button만을 통하여 float input을
            // 출력하도록 한다.

            _showStaticInput(jqContainer, jqForm);

            if (isHiddenInput) {
              jqFloat.addClass('show');
            } else {
              jqFloat.removeClass('show');
            }
          }

          _prevFocus = isFocus;
          _prevIsHiddenInput = isHiddenInput;
        }
      }

      /**
       * scoll 동안 값 변경이 발생 했는지 여부
       * @param {boolean} isFocus
       * @param {boolean} isHiddenInput
       * @returns {boolean}
       */
      function isChanged(isFocus, isHiddenInput) {
        return _prevFocus !== isFocus || _prevIsHiddenInput !== isHiddenInput;
      }

      /**
       * text input가 container의 scrolling에 의하여 viewport에서 보이지 않는 상태인지 여부
       * @param {object} jqContainer
       * @returns {boolean}
       * @private
       */
      function _isHiddenInput(jqContainer) {
        return $window.innerHeight < jqContainer.offset().top;
      }
    }
  }
})();
