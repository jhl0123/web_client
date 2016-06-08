(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rightSearch', rightSearch);

  function rightSearch($filter, $timeout, Dialog, jndKeyCode) {
    return {
      restrict: 'E',
      scope: {
        keyword: '=',
        isFocus: '=?',
        onChange: '&',
        onResetQuery: '&'
      },
      link: link,
      replace: true,
      templateUrl : 'app/right/search/search.html',
      controller: 'RightSearchCtrl'
    };

    function link(scope, el) {
      var _translate = $filter('translate');
      var _jqSearchBox = el.find('.rpanel-body-search__input');
      var _jqInitButton = el.find('.rpanel-search-init');

      var _timerKeywordChange;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        _attachDomEvents();
        _attachScopeEvents();
      }

      /**
       * attach dom events
       * @private
       */
      function _attachDomEvents() {
        _jqSearchBox.on('keyup', _onKeyDown);
        _jqInitButton.on('click', _onClick);
      }

      /**
       * attach scope events
       * @private
       */
      function _attachScopeEvents() {
        scope.$watch('keyword', _onKeywordChange);
        scope.$watch('isFocus', _onFocus);
      }

      /**
       * key down event handler
       * @param {object} event
       * @private
       */
      function _onKeyDown(event) {
        var target = event.target;
        var which = event.which;
        var value = target.value;

        if (jndKeyCode.match('ENTER', which)) {
          if (_validSearchKeyword(value)) {
            scope.onChange({
              $keyword: value
            });
          } else {
            Dialog.warning({
              title: _translate('@search-minimum-query-length')
            });
          }
        }
      }

      /**
       * keyword 검색 가능여부
       * @param {string} keyword
       * @returns {boolean}
       * @private
       */
      function _validSearchKeyword(keyword) {
        return keyword.length !== 1;
      }

      /**
       * 검색조건 초기화 클릭 이벤트 핸들러
       * @private
       */
      function _onClick() {
        scope.onResetQuery();
      }

      /**
       * keyword 변경 이벤트 핸들러
       * @param {string} value
       * @private
       */
      function _onKeywordChange(value) {
        clearTimeout(_timerKeywordChange);
        _timerKeywordChange = setTimeout(function() {
          scope.onChange({
            $keyword: value
          });
        }, 500);
      }

      /**
       * keyword 입력란에 포커스 가라는 이벤트 핸들러
       * @param {boolean} isFocus
       * @private
       */
      function _onFocus(isFocus) {
        if (isFocus === true) {
          // search directive의 template이 rendering 완료된 다음 focus항상 수행하도록 $timeout 사용한다.
          $timeout(function() {
            _jqSearchBox.focus();
          });
        }

        scope.isFocus = false;
      }
    }
  }
})();
