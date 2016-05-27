/**
 * @fileoverview 네트워크 오류로 인해 보내지 못한 text 메세지 directive
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('stickerPanel', stickerPanel);

  function stickerPanel($position, $timeout, jndKeyCode, Tutorial) {
    return {
      restrict: 'E',
      replace: true,
      scope: false,
      controller: 'StickerPanelCtrl',
      link: link,
      templateUrl: 'app/sticker/panel/sticker.panel.html'
    };

    function link(scope, el, attrs) {
      // dropdown parent dom element
      var _dropdownParent = attrs.dropdownParent;

      var _jqStickerPanel = el.find('.sticker_panel');
      var _jqStickerPanelBtn = el.find('.sticker_panel_btn');
      var _jqStickerPanelContents = el.find('.sticker_panel_contents');

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        _jqStickerPanelBtn.focus();

        scope.onCreateSticker = onCreateSticker;
        scope.autoScroll = autoScroll;

        scope.onToggled = onToggled;

        _attachDomEvents();

        if (_.isString(_dropdownParent)) {
          // sticker panel의 parent element 변경시 해당 element를 dom에서 찾을수 있도록
          // 보장하기 위해 $timeout을 수행한다.
          $timeout(_setDropdownParent);
        }
      }

      /**
       * attach dom events
       * @private
       */
      function _attachDomEvents() {
        _jqStickerPanelBtn.on('keydown', _onKeyDown);
      }

      /**
       * keydown event handler
       * @param {object} event
       * @private
       */
      function _onKeyDown(event) {
        var keyCode = event.keyCode;

        event.preventDefault();
        //event.stopPropagation();

        if (jndKeyCode.match('UP_ARROW', keyCode)) {
          scope.navActiveSticker(0, -1);
        } else if (jndKeyCode.match('RIGHT_ARROW', keyCode)) {
          scope.navActiveSticker(1, 0);
        } else if (jndKeyCode.match('DOWN_ARROW', keyCode)) {
          scope.navActiveSticker(0, 1);
        } else if (jndKeyCode.match('LEFT_ARROW', keyCode)) {
          scope.navActiveSticker(-1, 0);
        } else if (jndKeyCode.match('ENTER', keyCode)) {

          // select sticker
          scope.selectSticker();
        } else if (jndKeyCode.match('ESC', keyCode)) {

          // close sticker
          scope.$apply(function() {
            scope.status.isOpen = false;
          });
        }
      }

      /**
       * show hide 토글 핸들러
       * @param {boolean} isOpen 현재 show 되었는지 여부
       */
      function onToggled(isOpen) {
        if (isOpen) {
          _jqStickerPanel.addClass('open');
          _jqStickerPanel.off('transitionend.stickerPanel');

          setTimeout(function() {
            _jqStickerPanel.addClass('vivid');
          }, 30);

          scope.select({isOpen: true});
          _jqStickerPanelBtn.attr('tabIndex', -1);

          if (scope.name === 'chat') {
            Tutorial.hideTooltip('sticker');
          } else if (scope.name === 'file') {
            // file에서 sticker open시 댓글이 작성되지 않아 '_fileDetailBody' 영역이 sticker를 표현할 만큼 충분히 높지 않아
            // '_fileDetailBody'를 넘어서서 표현되어 viewport내에 보이지 않는 이슈 처리
            if ($('._fileDetailBody').offset().top > _jqStickerPanel.offset().top) {
              _jqStickerPanel.addClass('dropdown-menu-down');
            } else {
              _jqStickerPanel.addClass('dropdown-menu-up');
            }
          }
        } else {
          _jqStickerPanel.removeClass('vivid');
          _jqStickerPanel.one('transitionend.stickerPanel', function() {
            _jqStickerPanel.removeClass('open');
          });

          scope.resetRecentStickers();
          _jqStickerPanelBtn.removeAttr('tabIndex');
        }
      }

      /**
       * create sticker event handler
       */
      function onCreateSticker() {
        _jqStickerPanelBtn.focus();
      }

      /**
       * 특정 item이 list에서 보이도록 scroll 설정
       * @param {number} index
       */
      function autoScroll(index) {
        var jqItem = _jqStickerPanel.find('.sticker_panel_ul').children().eq(index);
        var itemPosition;
        var contPosition;
        var scrollTop;
        var compare;

        if (jqItem[0]) {
          scrollTop = _jqStickerPanelContents.scrollTop();

          itemPosition = $position.offset(jqItem);
          contPosition = $position.offset(_jqStickerPanelContents);

          compare = itemPosition.top - contPosition.top;
          if (compare < 0) {
            _jqStickerPanelContents.scrollTop(scrollTop + compare);
          } else if (compare + itemPosition.height > contPosition.height) {
            _jqStickerPanelContents.scrollTop(scrollTop + compare - contPosition.height + itemPosition.height);
          }
        }
      }

      /**
       * set dropdown parent
       * @private
       */
      function _setDropdownParent() {
        $(_dropdownParent).append(_jqStickerPanel);
      }
    }
  }
})();
