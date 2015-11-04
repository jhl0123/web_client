/**
 * @fileoverview 네트워크 오류로 인해 보내지 못한 text 메세지 directive
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('stickerPanel', stickerPanel);

  function stickerPanel($position, jndKeyCode) {
    var DEFAULT_WIDTH = 355;
    var DEFAULT_HEIGHT = 300;

    return {
      restrict: 'E',
      replace: true,
      scope: false,
      controller: 'StickerPanelCtrl',
      link: link,
      templateUrl: 'app/sticker/panel/sticker.panel.html'
    };

    function link(scope, el, attrs) {
      var jqStickerPanelBtn = el.find('.sticker_panel_btn');
      var jqStickerPanelContents = el.find('.sticker_panel_contents');

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        jqStickerPanelBtn.focus();

        scope.onCreateSticker = onCreateSticker;
        scope.autoScroll = autoScroll;

        scope.onToggled = onToggled;

         _setStickerPanelSize();
        _on();
      }

      /**
       * on listeners
       * @private
       */
      function _on() {
        jqStickerPanelBtn.on('keydown', _onKeyDown);
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
          scope.select();
          jqStickerPanelBtn.attr('tabIndex', -1)
        } else {
          jqStickerPanelBtn.removeAttr('tabIndex');
        }
      }

      /**
       * create sticker event handler
       */
      function onCreateSticker() {
        jqStickerPanelBtn.focus();
      }

      /**
       * set sticker panel size
       * @private
       */
      function _setStickerPanelSize() {
        var width = attrs.width || DEFAULT_WIDTH;
        var height = attrs.height || DEFAULT_HEIGHT;
        height -= el.find('.sticker_panel_tab').height();

        el.find('.sticker_panel').width(width);
        el.find('.sticker_panel_contents').width(width).height(height);
      }

      /**
       * 특정 item이 list에서 보이도록 scroll 설정
       * @param {number} index
       */
      function autoScroll(index) {
        var jqItem = el.find('.sticker_panel_ul').children().eq(index);
        var itemPosition;
        var contPosition;
        var scrollTop;
        var compare;

        if (jqItem[0]) {
          scrollTop = jqStickerPanelContents.scrollTop();

          itemPosition = $position.offset(jqItem);
          contPosition = $position.offset(jqStickerPanelContents);

          compare = itemPosition.top - contPosition.top;
          if (compare < 0) {
            jqStickerPanelContents.scrollTop(scrollTop + compare);
          } else if (compare + itemPosition.height > contPosition.height) {
            jqStickerPanelContents.scrollTop(scrollTop + compare - contPosition.height + itemPosition.height);
          }
        }
      }
    }
  }
})();
