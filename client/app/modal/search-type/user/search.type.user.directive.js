/**
 * @fileoverview search type user directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('searchTypeUser', searchTypeUser);

  function searchTypeUser() {
    return {
      restrict: 'E',
      replace: false,
      scope: {
        keywordTypes: '=',
        keywordType: '=',
        onKeywordTypeSelectCallback: '&onKeywordTypeSelect'
      },
      templateUrl: 'app/modal/search-type/user/search.type.user.html',
      link: link
    };

    function link(scope, el, attr, ctrl) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.activeIndex = _.findIndex(scope.keywordTypes, 'value', scope.keywordType);
        scope.selectItemText = scope.keywordTypes[scope.activeIndex].text;

        scope.isActive = isActive;
        scope.onSelectItem = onSelectItem;
        scope.onSelectActive = onSelectActive;
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
       * 특정 item active 상태 설정 이벤트 핸들러
       * @param {number} index
       */
      function onSelectActive(index) {
        scope.activeIndex = index;
      }

      /**
       * 특정 item 선택 이벤트 핸들러
       * @param {number} index
       */
      function onSelectItem(index) {
        var selectItem = scope.keywordTypes[index];
        var oldValue = scope.keywordType;

        scope.selectItemText = selectItem.text;
        scope.keywordType = selectItem.value;

        scope.onKeywordTypeSelectCallback({
          index: index,
          newValue: selectItem.value,
          oldValue: oldValue
        });
      }
    }
  }
})();
