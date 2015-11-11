/**
 * @fileoverview Sticker 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('StickerPanelCtrl', StickerPanelCtrl);

  function StickerPanelCtrl($scope, $attrs, jndPubSub, Sticker, JndUtil) {
    // 서버에서 group 리스트 API 완성전에 대비하여 임시로 만든 데이터
    var _groups = [
      {
        activeIndex: 0,
        className: 'recent'
      },
      // mobile 준비되면 그때 들어갈 예정
      //{
      //  activeIndex: 0,
      //  className: 'kiyomi',
      //  id: 101
      //},
      {
        activeIndex: 0,
        className: 'pangya',
        id: 100
      }
    ];

    var MAX_COLUMN = parseInt($attrs.maxColumns, 10);
    var _activeGroupIndex = 1;

    _init();

    /**
     * 초기화 메서드
     * @private
     */
    function _init() {
      $scope.groups = _groups;
      $scope.name = $attrs.name;
      $scope.status = {
        isOpen: false
      };

      $scope.onClickGroup = onClickGroup;
      $scope.selectSticker = selectSticker;

      $scope.navActiveSticker = navActiveSticker;
      $scope.select = select;

      $scope.selectActiveSticker = selectActiveSticker;
      $scope.isActiveSticer = isActiveSticer;
      $scope.isActiveGroup = isActiveGroup;
      $scope.isRecentGroup = isRecentGroup;

      _on();
    }

    /**
     * on listeners
     * @private
     */
    function _on() {
      if ($scope.name === 'chat') {
        $scope.$on('center:toggleSticker', _onCenterToggleSticker);
        $scope.$on('toggleQuickLauncher', _onToggleQuickLauncher);
      }
    }

    /**
     * toggle sticker event handler
     * @private
     */
    function _onCenterToggleSticker() {
      JndUtil.safeApply($scope, function() {
        $scope.status.isOpen = !$scope.status.isOpen;
      });
    }

    /**
     * toggle quick launcher
     * @private
     */
    function _onToggleQuickLauncher() {
      JndUtil.safeApply($scope, function() {
        $scope.status.isOpen = false;
      });
    }

    /**
     * group 아이콘 클릭시 핸들러
     * @param {event} clickEvent 클릭 이벤트
     * @param {object} group 그룹 데이터
     */
    function onClickGroup(clickEvent, group) {
      clickEvent.stopPropagation();
      select(group);
    }

    /**
     * select sticker event handler
     */
    function selectSticker(item) {
      var activeGroup = _groups[_activeGroupIndex];
      var list = $scope.list;

      item = item || list[activeGroup.activeIndex];

      if (item) {
        JndUtil.safeApply($scope, function() {
          $scope.status.isOpen = false;

          jndPubSub.pub('selectSticker:' + $scope.name, item);
        });
      }
    }

    /**
     * 해당 스티커 그룹을 선택한다.
     * @param {object} group 선택할 그룹
     * @private
     */
    function select(group, active) {
      group = group || _groups[_activeGroupIndex];

      _activeGroupIndex = _groups.indexOf(group);

      Sticker.getStickers(group.id)
        .then(function(stickers) {
          $scope.list = stickers;

          //_updateSelect(group);
          if (stickers.length > 0) {
            active ?  _setNextItem(stickers.length - 1) :  _setNextItem(0);
          }

          $scope.onCreateSticker();
        });
    }

    /**
     * 활성화된 sticker navigation
     * @param {number} x
     * @param {number} y
     */
    function navActiveSticker(x, y) {
      var activeGroup = _groups[_activeGroupIndex];
      var list = $scope.list;

      var activePointX = activeGroup.activeIndex % MAX_COLUMN;
      var activePointY = Math.floor(activeGroup.activeIndex / MAX_COLUMN);

      var controlPointX = activePointX + x;
      var controlPointY = activePointY + y;

      if (_isNextGroup(controlPointX, controlPointY, x, y)) {
        //setActiveItem(false);
        _setNextGroup((x > 0 || y > 0) ? 1 : -1);
      } else {
        $scope.$apply(function() {
          //setActiveItem(false);
          _setNextItem(list[controlPointY * MAX_COLUMN + controlPointX] == null && y > 0 ? list.length - 1 : controlPointY * MAX_COLUMN + controlPointX);
        });
      }
    }

    /**
     * select active sticker
     * @param {number} index
     */
    function selectActiveSticker(index) {
      _groups[_activeGroupIndex].activeIndex = index;
    }

    /**
     * is active sticker
     * @param {number} index
     * @returns {boolean}
     */
    function isActiveSticer(index) {
      return _groups[_activeGroupIndex].activeIndex === index;
    }

    /**
     * is active group
     * @param {number} index
     * @returns {boolean}
     */
    function isActiveGroup(index) {
      return _activeGroupIndex === index;
    }

    /**
     * is recent group
     * @param {number} index
     * @returns {boolean}
     */
    function isRecentGroup(index) {
      return _groups[0] === _groups[index];
    }

    /**
     * 다음 group 으로 이동해야 하는지 여부
     * @param {number} controlPointX - 다음 이동해야할 x
     * @param {number} controlPointY - 다음 이동해야할 y
     * @param {number} x - x 가감
     * @param {number} y - y 가감
     * @returns {boolean}
     * @private
     */
    function _isNextGroup(controlPointX, controlPointY, x, y) {
      var list = $scope.list;
      return ((list[controlPointY * MAX_COLUMN] == null && (y > 0 || y < 0)) || (list[controlPointY * MAX_COLUMN + controlPointX] == null && (x > 0 || x < 0))) && _groups.length > 1;
    }

    /**
     * 다음 group으로 이동
     * @param {number} next - 이동해야할 group +,-
     * @private
     */
    function _setNextGroup(next) {
      select(_getNextGroup(next), next < 0);
    }

    /**
     * 다음 sticker로 이동
     * @param {number} index - 이동해야할 sticker index
     * @private
     */
    function _setNextItem(index) {
      selectActiveSticker(index, true);

      setTimeout(function() {
        $scope.autoScroll(index);
      });
    }

    /**
     * 다음 이동해야할 group 전달
     * @param {number} next - 이동 해야할 group +,-
     * @returns {{isRecent, isSelected, activeIndex, className}|{isRecent, isSelected, activeIndex, className, id}|*}
     * @private
     */
    function _getNextGroup(next) {
      var group;
      if (_groups[_activeGroupIndex + next] == null) {
        // 다음으로 넘어갈 group 존재하지 않음

        // 순환처리
        group = next > 0 ? _groups[0] : _groups[_groups.length - 1];
      } else {
        group = _groups[_activeGroupIndex + next];
      }

      return group;
    }
  }
})();
