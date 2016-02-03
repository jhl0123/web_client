/**
 * @fileoverview quick launcher modal directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('notificationAudioMenu', notificationAudioMenu);

  function notificationAudioMenu(DesktopNotificationUtil) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        list: '=',
        value: '=',
        isDisabled: '=',
        onSelectCallback: '&onSelect'
      },
      link: link,
      templateUrl: 'app/modal/settings/notification/setting.notification.audio.html'
    };

    function link(scope) {
      var notificationAudio = DesktopNotificationUtil.getNotificationAudio();

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        _setSelectItem(_.findIndex(scope.list, {'value': scope.value}));

        scope.isActive = isActive;

        scope.onSelectItem = onSelectItem;
        scope.onSelectActive = onSelectActive;
        scope.onSoundClick = onSoundClick;
      }

      /**
       * 특정 item 선택 이벤트 핸들러
       * @param {number} index
       */
      function onSelectItem(index) {
        _setSelectItem(index);
        _playSound(index);

        scope.onSelectCallback({
          $index: index
        })
      }

      /**
       * 특정 item active 상태 설정 이벤트 핸들러
       * @param {number} index
       */
      function onSelectActive(index) {
        scope.activeIndex = index;
      }

      /**
       * sound 듣기 클릭 이벤트 핸들러
       * @param {object} event
       */
      function onSoundClick(event) {
        // dropdown menu 닫기 방지를 위한 버블링 cut
        event.stopPropagation();
      }

      /**
       * active 상태 인지 여부
       * @param {number} index
       * @returns {boolean}
       */
      function isActive(index) {
        return scope.activeIndex === index;
      }

      /**
       * 선택 아이템 설정
       * @param {number} index
       * @private
       */
      function _setSelectItem(index) {
        var item;
        if (item = scope.list[index]) {
          scope.selectedItemText = item.text;
        }
      }

      /**
       * play sound
       * @param {number} index
       * @private
       */
      function _playSound(index) {
        var item;
        if (item = scope.list[index]) {
          notificationAudio.play(item.value);
        }
      }
    }
  }
})();
