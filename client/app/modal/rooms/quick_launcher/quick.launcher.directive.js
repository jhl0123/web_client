/**
 * @fileoverview quick launcher modal directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('quickLauncherModal', quickLauncherModal);

  function quickLauncherModal($filter, jndPubSub, jndKeyCode) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el) {
      var noMatchesMsg = $filter('translate')('@quick-launcher-no-matches');
      var noMatchesButtonMsg = $filter('translate')('@quick-launcher-create-topic-with-query');
      var jqFilter = el.find('#quick-launcher-filter');

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        setTimeout(function () {
          jqFilter.focus();
        }, 50);

        _on();
      }

      /**
       * on listeners
       * @private
       */
      function _on() {
        scope.$watch('roomNameQuery', _onChangeRoomNameQuery);
        scope.$on('updateBadgePosition', _onUpdateBadgePosition);

        jqFilter.on('keydown', _onKeyDown);
      }

      /**
       * badge position update event handler
       * @private
       */
      function _onUpdateBadgePosition() {
        // badge position update시 left side api가 갱신 되어 있으므로 room list도 갱신한다.
        jndPubSub.pub('updateList:roomList');
      }

      /**
       * room name query change event handler
       * @param {string} value - filter 문자열
       * @private
       */
      function _onChangeRoomNameQuery(value) {
        if (scope.isEmptyMatches) {
          el.find('.quick-launcher-list').height(244);
          value = jqFilter.val();

          scope.noMatchesMsg = noMatchesMsg.replace('{{query}}', '<strong>' + value + '</strong>');
          value.length > 10 && (value = value.substring(0, 10) + '...');
          scope.noMatchesButtonMsg = '<i class="icon-plus"></i><span>' + noMatchesButtonMsg.replace('{{query}}', '<strong>' + value + '</strong>') + '</span>';
        }
      }

      /**
       * key down event handler
       * @param {object} event
       * @private
       */
      function _onKeyDown(event) {
        var which = event.which;

        if (_hasJumpIndex() && event.ctrlKey || event.metaKey) {
          if (jndKeyCode.match('UP_ARROW', which)) {
            event.preventDefault();
            _jumpIndex('up');
          } else if (jndKeyCode.match('DOWN_ARROW', which)) {
            event.preventDefault();
            _jumpIndex('down');
          }
        }
      }

      /**
       * has jump index
       * @returns {Array|boolean}
       * @private
       */
      function _hasJumpIndex() {
        return scope.jumpListIndexs && scope.jumpListIndexs.length > 0
      }

      /**
       * list의 특정 index로 점프함
       * @param {string} type - [up|down]
       * @private
       */
      function _jumpIndex(type) {
        var activeIndex = scope.getActiveIndex();
        var list = scope.jumpListIndexs;
        var direction = type === 'up' ? -1 : 1;
        var jumpIndex = 0;

        _.forEach(list, function(item, index) {
          if (type === 'up') {
            if (item === activeIndex) {
              // list의 item 분류중 첫 item index와 같은경우 이전 item 분류의 첫 item index로 이동한다.
              jumpIndex = index + direction;
            } else if (item < activeIndex && (list[index + direction] < activeIndex)) {
              // list의 item 분류중 첫 item index가 아니고 특정 item index중 하나라면 이전 item 분류의 첫 item index로 이동한다.
              jumpIndex = index;
            }
          } else {
            if (item <= activeIndex && (list[index + direction] >= activeIndex || list[index + direction] == null)) {
              // list의 item 분류중 특정 item index와 같다면 다음 item 분류의 첫 item index로 이동한다.
              jumpIndex = index + direction;
            }
          }
        });

        jumpIndex = jumpIndex >= list.length ? 0 : jumpIndex < 0 ? list.length - 1 : jumpIndex;
        jndPubSub.pub('setActiveIndex:roomList', scope.jumpListIndexs[jumpIndex]);
      }
    }
  }
})();
