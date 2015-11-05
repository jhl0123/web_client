/**
 * @fileoverview  unread 뱃지 directive
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('badge', badge);

  /* @ngInject */
  function badge(jndPubSub, UnreadBadge, NotificationManager) {
    return {
      link: link,
      scope: {
          content: '@content',
          group: '@group',
          key: '@key',
          entity: '@entity'
      },
      restrict: 'E',
      templateUrl: 'app/left/badge/badge.html'
    };

    function link(scope, el, attrs, ctrl) {
      var key = scope.group + '_' + scope.key;
      var jqParent = scope.group === 'header' ? el.parent().parent() : el.parent();

      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        scope.$watch('content', _onContentChange);
        scope.$on('$destroy', _onDestroy);
        scope.$on('updateBadgePosition', _onUpdateBadgePosition);
        _setCount();
      }

      /**
       * 노출할 count 값을 갱신한다.
       * @private
       */
      function _setCount() {
        if (scope.content > 999) {
          scope.count = '999+';
        } else {
          scope.count = scope.content;
        }
      }

      /**
       * 뱃지 내용 변경 시 핸들러
       * @param {string} newVal 변경된 값
       * @param {string} oldVal 변경전 값
       * @private
       */
      function _onContentChange(newVal, oldVal) {
        if (newVal <= 0 || _.isUndefined(newVal)) {
          UnreadBadge.remove(key);
          NotificationManager.remove(scope.key);
        } else {
          UnreadBadge.add(key, _getBadgeData());
        }

        jndPubSub.updateBadgePosition();
        _setCount();
      }

      /**
       * badge 위치 데이터를 가공하여 반환한다.
       * @returns {{top: number, bottom: *, entity: string, el: *}}
       * @private
       */
      function _getBadgeData() {
        var top = _getTop();
        var bottom = top + jqParent.height();
        return {
          top: top,
          bottom: bottom,
          entity: scope.entity,
          el: el
        };
      }

      /**
       * 뱃지의 위치 정보를 업데이트 한다.
       * @private
       */
      function _onUpdateBadgePosition() {
        if (scope.content > 0) {
          UnreadBadge.update(key, _getBadgeData());
        }
      }

      /**
       * scope 제거시 이벤트 핸들러
       * @private
       */
      function _onDestroy() {
        UnreadBadge.remove(key);
      }

      /**
       * top 절대 위치를 반환한다.
       * @returns {number} top 위치
       * @private
       */
      function _getTop() {
        var scrollTop = $('#lpanel-list-container').scrollTop();
        return scrollTop + jqParent.offset().top;
      }
    }
  }
})();
