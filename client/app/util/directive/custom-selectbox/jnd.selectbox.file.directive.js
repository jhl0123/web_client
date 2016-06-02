/**
 * @fileoverview file 커스텀 셀렉트박스 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndSelectboxFile', jndSelectboxFile);

  function jndSelectboxFile($filter, JndUtil) {
    return {
      restrict: 'AE',
      link: link,
      replace: true,
      scope: {
        selectedValue: '=jndDataModel',
        list: '=jndDataList',
        isDisabled: '=jndDataIsDisabled'
      },
      templateUrl: 'app/util/directive/custom-selectbox/jnd.selectbox.file.html'
    };

    function link(scope, el, attrs) {
      var CSS_ICON_MAP = {
        'googleDocs': 'fileicon-document-google-drive',
        'document': 'fileicon-txt',
        'presentation': 'fileicon-ppt',
        'spreadsheet': 'fileicon-excel',
        'pdf': 'fileicon-pdf',
        'image': 'fileicon-img',
        'video': 'fileicon-video',
        'audio': 'fileicon-audio',
        'archive': 'fileicon-zip'
      };

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
        scope.cssIconMap = CSS_ICON_MAP;
        scope.fileList = [];
        
        _.forEach(scope.list, function(item, index) {
          if (index > 0) {
            scope.fileList.push(item);
          }
        });
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

        selectedItem = _.find(scope.list, function(item) {
          return item.value === scope.selectedValue;
        });
        return selectedItem ? selectedItem.viewValue : scope.list[0].viewValue;
      }

      /**
       * Data 를 초기화 한다
       * @private
       */
      function _initializeData() {
        _.forEach(scope.list, function(item) {
          item.extCssIcon = CSS_ICON_MAP[item.value]
        });
        scope.searchList = [];
        scope.selectedName = _getSelectedName();
      }

      /**
       * change 이벤트 핸들러
       * @param jqTarget
       */
      function onChange(jqTarget) {
        var item = jqTarget.data('item');
        if (item) {
          scope.selectedName = item.viewValue;
          scope.selectedValue = item.value;
        } else {
          scope.selectedName = scope.list[0].viewValue;
          //모든 파일의 value
          scope.selectedValue = scope.list[0].value;
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
              start = item.viewValue.toLowerCase().indexOf(keyword);
              if (start !== -1) {
                item.extSearchName = _highlight(item.viewValue, start, keyword.length);
                result.push(item);
              }
            });
          }
          scope.searchList = $filter('orderByQueryIndex')(result, 'viewValue', keyword);
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
