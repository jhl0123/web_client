/**
 * @fileoverview file detail의 scroll directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailContent', fileDetailContent);

  /* @ngInject */
  function fileDetailContent($window) {
    return {
      restrict: 'A',
      controller: 'FileDetailContentCtrl',
      link: link
    };

    function link(scope, el, attrs, ctrl) {
      var _jqFileDetailBody = el.find('._fileDetailBody');

      var _prevFocus;
      var _prevIsHiddenInput;

      // float input인지 여부
      ctrl.hasFloatInput = false;
      ctrl.showFloatInput = showFloatInput;
      ctrl.resizeFileDetailBody = resizeFileDetailBody;
      ctrl.setCommentInputLayout = setCommentInputLayout;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        ctrl.setJqScrollContainer(_jqFileDetailBody);

        _attachScopeEvents();
        _attachDomEvents();
      }

      /**
       * attach scope events
       * @private
       */
      function _attachScopeEvents() {
        scope.$on('$destroy', _onDestroy);
        scope.$on('JndZoom:zoom', _onCurrentZoomScaleChanged);
      }

      /**
       * scope destroy event handler
       * @private
       */
      function _onDestroy() {
        _detachDomEvents();
      }

      /**
       * attach dom events
       * @private
       */
      function _attachDomEvents() {
        _jqFileDetailBody.scroll(_onScroll);
        $($window).on('resize', _onResize);
      }

      /**
       * detach dom events
       * @private
       */
      function _detachDomEvents() {
        $($window).off('resize', _onResize);
      }

      /**
       * on zoom scale changed
       * @private
       */
      function _onCurrentZoomScaleChanged() {
        resizeFileDetailBody();
      }

      /**
       * scroll event handler
       * @private
       */
      function _onScroll() {
        setCommentInputLayout();
      }

      /**
       * window resize event handler
       * @private
       */
      function _onResize() {
        resizeFileDetailBody();
      }

      /**
       * show float input
       */
      function showFloatInput() {
        var jqInput = ctrl.getJqInput();

        jqInput.float.removeClass('show');
        _showFloatInput(jqInput.form, true);
        jqInput.text.focus();
      }

      /**
       * file detail body의 size를 재설정함
       */
      function resizeFileDetailBody() {
        var jqFileDetailHeader = ctrl.getJqHeader();

        _jqFileDetailBody
          .addClass('opac-in')
          .css({top: jqFileDetailHeader.outerHeight()})
      }

      /**
       * show float input
       * text input란이 file detail의 오른쪽 하단에 항상 고정되어 출력되도록 함.
       * @param {object} jqForm
       * @private
       */
      function _showFloatInput(jqForm, hasAnimation) {
        if (!ctrl.hasFloatInput) {
          jqForm.appendTo(el);

          if (hasAnimation) {
            jqForm.addClass('float');
            // float을 넣었다가 setTimeout을 사용하여 float을 제거하여 text input에 에니메이션 효과를 부여한다.
            setTimeout(function() {
              jqForm.removeClass('float');
            });
          }

          ctrl.hasFloatInput = true;
        }
      }

      /**
       * comment input의 layout을 설정함
       */
      function setCommentInputLayout() {
        var jqInput = ctrl.getJqInput();
        var jqContainer = jqInput.container;
        var jqForm =  jqInput.form;
        var jqText = jqInput.text;
        var jqFloat = jqInput.float;

        var isFocus = jqText.is(':focus');
        var isHiddenInput = _isHiddenInput(jqContainer);

        if (_isChanged(isFocus, isHiddenInput)) {
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
       * @private
       */
      function _isChanged(isFocus, isHiddenInput) {
        return _prevFocus !== isFocus || _prevIsHiddenInput !== isHiddenInput;
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
