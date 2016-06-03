/**
 * @fileoverview file 커스텀 셀렉트박스 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndSelectboxCommon', jndSelectboxCommon);

  function jndSelectboxCommon($filter, JndUtil) {
    return {
      restrict: 'AE',
      link: link,
      replace: true,
      scope: {
        selectedValue: '=jndDataModel',
        list: '=jndDataList',
        isDisabled: '=jndDataIsDisabled'
      },
      templateUrl: 'app/util/directive/custom-selectbox/jnd.selectbox.common.html'
    };

    function link(scope, el, attrs) {
      var _lastKeyword = '';

      scope.close = close;
      scope.onKeyUp = onKeyUp;
      scope.toggleShow = toggleShow;
      scope.onChange = onChange;

      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        scope.isShown = false;
        scope.searchKeyword = '';

        _initializeData();
        _attachEvents();
        _attachDomEvents();
      }

      /**
       * selectbox 를 닫는다
       */
      function close() {
        el.find('.custom-select-box').hide();
        scope.isShown = false;
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _detachDomEvents();
      }

      /**
       * 이벤트 바인딩 한다
       * @private
       */
      function _attachEvents() {
        scope.$on('$destroy', _onDestroy);
        scope.$watch('selectedValue', _setSelectedName);
        scope.$watch('list', function() {
          _initializeData();
        });

      }

      /**
       * DOM 이벤트 바인딩
       * @private
       */
      function _attachDomEvents() {
        $(document).on('mousedown', _onMouseDownDocument);
      }

      /**
       * select 된 name 으로 노출한다
       * @private
       */
      function _setSelectedName() {
        JndUtil.safeApply(scope, function() {
          scope.selectedName = _getSelectedName();
        });
      }

      /**
       * DOM 이벤트 바인딩 해제
       * @private
       */
      function _detachDomEvents() {
        $(document).off('mousedown', _onMouseDownDocument);
      }

      /**
       * Document 의 mouse-down 이벤트 핸들러
       * @param {Event} clickEvent
       * @private
       */
      function _onMouseDownDocument(clickEvent) {
        if (!$(clickEvent.target).closest('._selectbox').is(el)) {
          JndUtil.safeApply(scope, function() {
            el.find('.custom-select-box').hide();
            close();
          });
        }
      }

      /**
       * 현재 선택된 item 의 name 값을 반환한다
       * @returns {*}
       * @private
       */
      function _getSelectedName() {
        var selectedItem;
        _.forEach(scope.list, function(item) {
          if (item.groupName) {
            _.forEach(item.groupList, function(unit) {
              if (unit.value === scope.selectedValue) {
                selectedItem = unit;
              }
            });
          } else {
            if (item.value === scope.selectedValue) {
              selectedItem = item;
            }
          }
          if (selectedItem) {
            return false;
          }
        });
        if (!selectedItem) {
          selectedItem = _getDefaultItem();
          scope.selectedValue = selectedItem.value;
        }
        return selectedItem.text;
      }

      /**
       * selectedValue 가 없을 경우 default item 을 반환한다
       * @returns {{text: string, value: string}}
       * @private
       */
      function _getDefaultItem() {
        var defaultItem;
        _.forEach(scope.list, function(item) {
          if (item.groupName) {
            _.forEach(item.groupList, function(unit) {
              if (!unit.isDisabled) {
                defaultItem = unit;
                return false;
              }
            });
            if (defaultItem) {
              return false;
            }
          } else {
            if (!item.isDisabled) {
              defaultItem = item;
              return false;
            }
          }
        });
        defaultItem = defaultItem ||  {
          text: '',
          value: ''
        };
        return defaultItem;
      }

      /**
       * Data 를 초기화 한다
       * @private
       */
      function _initializeData() {
        scope.searchList = [];
        scope.selectedName = _getSelectedName();
      }

      /**
       * change 이벤트 핸들러
       * @param {object} jqTarget
       * @param {object} targetScope
       */
      function onChange(jqTarget, targetScope) {
        var item;
        if (targetScope.item) {
          scope.selectedName = targetScope.item.text;
          scope.selectedValue = targetScope.item.value;
        } else {
          item = _getDefaultItem();
          scope.selectedName = item.text;
          //모든 파일의 value
          scope.selectedValue = item.value;
        }
      }

      /**
       * select 레이어의 노출 여부를 toggle 한다
       */
      function toggleShow() {
        if (!scope.isDisabled) {
          scope.isShown = !scope.isShown;
          _initializeData();
        }
      }
      /**
       * keyup 이벤트 핸들러
       */
      function onKeyUp(keyEvent) {
        _search($(keyEvent.target).val());
      }

      /**
       * 메시지를 검색한다
       * @param {string} keyword
       * @private
       */
      function _search(keyword) {
        var start;
        var result = [];
        keyword = _.trim(keyword);

        if (!_isSameKeyword(keyword)) {
          _lastKeyword = keyword;
          if (keyword) {
            keyword = keyword.toLowerCase();
            _.each(scope.list, function (item) {
              if (item.groupName) {
                _.forEach(item.groupList, function (item) {
                  start = item.text.toLowerCase().indexOf(keyword);
                  if (start !== -1) {
                    item.extSearchName = _highlight(item.text, start, keyword.length);
                    result.push(item);
                  }
                });
              } else {
                start = item.text.toLowerCase().indexOf(keyword);
                if (start !== -1) {
                  item.extSearchName = _highlight(item.text, start, keyword.length);
                  result.push(item);
                }
              }
            });
          }
          scope.searchList = $filter('orderByQueryIndex')(result, 'text', keyword);
        }
      }

      /**
       * 동일 keyword 인지 여부를 반환한다
       * @param {string} keyword
       * @returns {boolean}
       * @private
       */
      function _isSameKeyword(keyword) {
        return _lastKeyword === keyword;
      }

      /**
       * 검색한 message 를 highlight 처리한다
       * @param {string} string - 검색 대상 string
       * @param {number} start - 검색할 string 이 검출된 시작 위치
       * @param {number} length - 검색할 string 의 길이
       * @returns {string} - highlight 처리된 결과
       * @private
       */
      function _highlight(string, start, length) {
        var strArr = [
          string.substring(0, start),
          '<b>',
          string.substring(start, start + length),
          '</b>',
          string.substring(start + length)
        ];
        return strArr.join('');
      }
    }
  }
})();
