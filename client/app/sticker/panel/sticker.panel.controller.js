/**
 * @fileoverview Sticker 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('StickerPanelCtrl', StickerPanelCtrl);

  function StickerPanelCtrl($scope, $attrs, jndPubSub, Sticker, JndUtil, AccountHasSeen) {
    var _groups;

    var MAX_COLUMN = parseInt($attrs.maxColumns, 10);
    var _activeGroupIndex = 0;

    var _recentStickers;

    _init();

    /**
     * 초기화 메서드
     * @private
     */
    function _init() {
      $scope.name = $attrs.name;
      $scope.stickerStatus = {
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

      $scope.resetRecentStickers = resetRecentStickers;

      _attachEvents();

      _setGroups();
    }

    /**
     * set groups
     * @private
     */
    function _setGroups() {
      var stickerGroups = Sticker.getStickerGroups();

      _groups = [];
      _.each(stickerGroups, function(stickerGroup) {
        var group = _.clone(stickerGroup);
        group.activeIndex = 0;

        _groups.push(group);
      });

      $scope.groups = _groups;
    }

    /**
     * attach events
     * @private
     */
    function _attachEvents() {
      $scope.$on($scope.name + ':toggleSticker', _onToggleSticker);
      $scope.$on('modalHelper:opened', _onModalOpened);
    }

    /**
     * toggle sticker event handler
     * @private
     */
    function _onToggleSticker() {
      JndUtil.safeApply($scope, function() {
        $scope.stickerStatus.isOpen = !$scope.stickerStatus.isOpen;
      });
    }

    /**
     * modal opened event handler
     * @private
     */
    function _onModalOpened() {
      JndUtil.safeApply($scope, function() {
        $scope.stickerStatus.isOpen = false;
      });
    }

    /**
     * group 아이콘 클릭시 핸들러
     * @param {event} clickEvent 클릭 이벤트
     * @param {object} group 그룹 데이터
     */
    function onClickGroup(clickEvent, group) {
      clickEvent.stopPropagation();
      select({
        group: group
      });
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
          $scope.stickerStatus.isOpen = false;

          jndPubSub.pub('selectSticker:' + $scope.name, item);
        });
      }
    }

    /**
     * 해당 스티커 그룹을 선택한다.
     * @param {object} options
     * @param {object} [options.group]
     * @param {boolean} [options.isForward] - 현재 텝에서 앞(왼쪽)의 텝으로 이동하는지 여부
     * @param {boolean} [options.isOpen] - sticker menu가 열림 여부
     * @private
     */
    function select(options) {
      var group = options.group || _groups[_activeGroupIndex];
      var isForward = options.isForward;

      _activeGroupIndex = _groups.indexOf(group);

      if (_isResentStickers(group) && _recentStickers != null) {
        _setStickers(group, _recentStickers, isForward);
      } else {
        Sticker.getStickers(group.id)
          .then(function(stickers) {
            if (options.isOpen && group.id === 'recent' && !stickers.length) {
              select({
                group: _groups[1]
              });
            } else {
              _setStickers(group, stickers, isForward);
            }
          });
      }
    }

    /**
     * sticker dropdown menu에 출력할 sticker item을 설정한다.
     * @param {object} group
     * @param {array} stickers
     * @param {boolean} isForward - 현재 텝에서 앞(왼쪽)의 텝으로 이동하는지 여부
     * @private
     */
    function _setStickers(group, stickers, isForward) {
      JndUtil.safeApply($scope, function() {
        //dingo 스티커에 대해 isNew 제거 처리
        //TODO: Dingo 스티커에 대한 new 아이콘 제거시 아래 로직 제거해야 함.
        if (group.id === 103) {
          AccountHasSeen.set('STICKER_DINGO', true);
          group.isNew =false;
        }
        $scope.list = stickers;
      });

      if (_isResentStickers(group)) {
        _recentStickers = stickers;
        $scope.isRecentEmpty = !stickers || !stickers.length
      } else {
        $scope.isRecentEmpty = false;
      }

      if (stickers.length > 0) {
        isForward ? _setNextItem(stickers.length - 1) : _setNextItem(0);
      }

      $scope.onCreateSticker();
    }

    /**
     * 최근 사용 sticker 그룹인지 여부
     * @param {object} group
     * @returns {boolean}
     * @private
     */
    function _isResentStickers(group) {
      return _groups[0] === group;
    }

    /**
     * 최근 사용 sticker 초기화
     */
    function resetRecentStickers() {
      _recentStickers = null;
      $scope.isRecentEmpty = false;
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
      JndUtil.safeApply($scope, function() {
        select({
          group: _getNextGroup(next),
          isForward: next < 0
        });
      });
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
